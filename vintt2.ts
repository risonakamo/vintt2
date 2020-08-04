import fs from "fs-extra";
import psList from "ps-list";
import _ from "lodash";

async function main()
{
    console.log(await watchPrograms(getConfiguration()));
}

// retrieve vintt configuration
function getConfiguration():VinttConfiguration
{
    var config:VinttConfiguration=fs.readJsonSync(
        "config/vintt-config.json",{throws:false});

    if (!config)
    {
        console.log("failed to load configuration");
        return {};
    }

    return config;
}

// watches for a program. returns when it found something.
async function watchPrograms(config:VinttConfiguration):Promise<FoundProgramResult>
{
    return new Promise((resolve)=>{
        var exeNames:Set<string>=new Set(Object.keys(config));
        var interval=setInterval(async ()=>{
            var foundProgram:ProcessDescriptor|undefined=_.find(await psList(),
            (x:ProcessDescriptor)=>{
                return exeNames.has(x.name);
            });

            if (foundProgram)
            {
                resolve({
                    exe:foundProgram.name,
                    name:config[foundProgram.name]
                });

                clearInterval(interval);
            }
        },2000);
    });
}

main();