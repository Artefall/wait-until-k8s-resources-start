const child_process = require('child_process');
const http = require('http');

const commandResult = child_process.execSync('kubectl get services --output=json');

const servicesFullUrlToCheck = [];

JSON.parse(commandResult)
            .items
            .forEach(item => item.spec.ports
            .forEach(port => servicesFullUrlToCheck.push(`${port.name}:${port.port}/health`)));

console.log("Services: " + servicesFullUrlToCheck);

function request(url){

    return new Promise(resolve => {
        http.get(`http://${url}`, res => {
            resolve(res.statusCode);
        }).on('error', () => resolve(-1));
    });
}            

function sleep(ms){
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
}

async function testServices(services){

    let servicesDown = true;

    while (servicesDown){
        await sleep(10000);

        const codes = [];

        for (let i = 0; i < services.length; i++){
                let code = await request(services[i]);

                if (code !== 200) console.log(`Service ${services[i]} is not available`)

                codes.push(code);
        }

        servicesDown = codes.some(code => code !== 200);

        if (servicesDown) console.log('All resources are not up yet');
        else console.log('Success! Fll resources is up!');

    }
}

testServices(servicesFullUrlToCheck);