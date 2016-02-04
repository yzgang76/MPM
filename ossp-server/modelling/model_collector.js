/**
 * Created by yanzhig on 2/4/2016.
 * TO load model definitions from JSON file
 */

var path=require('path');
//var input=require();
var _ = require(path.join(__dirname,'/../node_modules/lodash/index'));
var n4j=require(path.join(__dirname, '/../neo4j_module/neo4j_funs'));
var dataPath=path.join(__dirname, '../data/');
var async=require(path.join(__dirname,'/../node_modules/async/dist/async'));
var cMaker=require(path.join(__dirname,'/../lib/cypherMaker'));
module.exports = (function() {
    'use strict';
    var M = {};

    /**
     *
     * @param model: model object: domain mush be unique;
     * @param callback: err
     */
    function injectModel(model,callback){
        try{
            var domain=_.get(model,'domain');
            var elements= _.get(model,'elements');
            var relationships= _.get(model,'relationships');
            if(!domain||!elements||!_.isArray(elements)||!_.isArray(relationships)){
                callback(new Error('Invalid model data'));
            }else{
                //inject models
                var statements=cMaker.getCypherInjectModel(domain,elements,relationships);
                n4j.runCypherStatementsReturnErrors(statements,function(err,results){
                    if(err){
                        console.error('injectModel error:',JSON.stringify(err));
                    }
                    if(_.isArray(results)&&results.length>0){
                        console.error('injectModel error:',JSON.stringify(results));
                    }
                    callback(null);  //not to corrupt the whole process.
                });
            }
        }catch(e){
            callback(e);
        }
    }
    M.collect=function(fileName,callback){
        if(!fileName){
            callback(new Error('Invalid File Name'),null);
        }else{
            var models=require(dataPath+fileName);
            async.each(models,injectModel,function(err){
                if(err){
                    console.error("collect model from "+fileName+" with error:",err);
                }
                callback(null,null);
            });
        }
    };

    return M;
}());