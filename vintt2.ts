import fs from "fs-extra";
import psList from "ps-list";
import _ from "lodash";
import NanoTimer from "nanotimer";
import log from "log-update";
import stripIndent from "strip-indent";

async function main()
{
    var foundProgram:FoundProgramResult=await watchPrograms(getConfiguration());
    timeProgram(foundProgram);
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
        log("watching...");
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

// begin timing a program. displays on screen various timing information and about
// the currently running program. writes to file on the program.
function timeProgram(program:FoundProgramResult):void
{
    var timer:NanoTimer=new NanoTimer();
    var currentTime:number=0;

    timer.setInterval(()=>{
        log(stripIndent(`
            ${program.name}
            Current Session: ${currentTime} minutes
            Total Time: 2.1 hours
        `));

        currentTime+=60;
    },"","1.5s");
}

main();