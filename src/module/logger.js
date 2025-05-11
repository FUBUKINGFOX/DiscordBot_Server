function log_info(module,type,msg){
    if(module==undefined&&type==undefined){
        console.log(`\x1b[94m[INFO]: ${msg}\x1b[0m`)
    }
    if(module==undefined){
        module = "<SYS>"
    }
    if(type==undefined){
        type = "NULL"
    }
    console.log(`\x1b[94m[INFO][${module} / ${type}]: ${msg}\x1b[0m`)
}

function log_warn(module,type,msg){
    if(module==undefined&&type==undefined){
        console.log(`\x1b[93m[WARN]: ${msg}\x1b[0m`)
    }
    if(module==undefined){
        module = "<SYS>"
    }
    if(type==undefined){
        type = "NULL"
    }
    console.log(`\x1b[93m[WARN][${module} / ${type}]: ${msg}\x1b[0m`)
}

function log_err(module,type,msg){
    if(module==undefined&&type==undefined){
        console.log(`\x1b[94m[ERROR]: ${msg}\x1b[0m`)
    }
    if(module==undefined){
        module = "<SYS>"
    }
    if(type==undefined){
        type = "NULL"
    }
    console.log(`\x1b[91m[ERROR][${module} / ${type}]: ${msg}\x1b[0m`)
}

module.exports.log_info = log_info
module.exports.log_warn = log_warn
module.exports.log_err = log_err