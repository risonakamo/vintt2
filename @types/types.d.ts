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