// main program configuration json schema
interface VinttConfiguration
{
    [exeName:string]:string
}

// time.json schema
interface ProgramTimes
{
    [programName:string]:number
}

interface FoundProgramResult
{
    exe:string
    name:string
}

interface CliOptions
{
    addProgram?:{
        exe:string
        name:string
    }

    showTimes?:boolean

    doWatch?:boolean
}