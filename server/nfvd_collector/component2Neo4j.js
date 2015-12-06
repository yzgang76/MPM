/**
 * Created by yanzhig on 12/1/2015.
 */

var path = require('path');

var O = require(path.join(__dirname, './nfvd-object-orient.js'));
var _ = require(path.join(__dirname, '/../node_modules/lodash/index'));
var C = require(path.join(__dirname, '/../lib/common-funs'));
var async= require(path.join(__dirname, '/../node_modules/async/dist/async'));
module.exports = (function () {
    'use strict';
    var N = {};
    var COM = O.component;
    var ART= O.artifact;

    var url_neo4j = '/db/data/transaction/commit';

    N.collectNFVComponent = function (req, res) {

        function _com2Neo4j(com, errs,callback) {
            function _inspectComponent(com,parentID){
                var rootid=COM.getComponentID(com);
                nodes.push({
                    label:'COMPONENT',
                    properties:{
                        id:rootid,
                        name:COM.getComponentName(com),
                        type:COM.getComponentType(com)
                    }
                });

                if(parentID){
                    rels.push({
                        label:'HAS_CHILD',
                        parent:parentID,
                        parent_label:"COMPONENT",
                        child:rootid,
                        child_label:"COMPONENT",
                        properties:{

                        }
                    });
                }

                _.forEach(COM.getComponentImmediateArtifacts(com),function(art){
                    var id=ART.getID(art);
                    nodes.push({
                        label:'ARTIFACT',
                        properties:{
                            id:id,
                            name:ART.getDisplayName(art),
                            type:ART.getFamily(art),
                            category:ART.getCategory(art),
                            state:ART.getState(art)
                        }
                    });

                    rels.push({
                        label:'CONSISTED_OF',
                        parent:rootid,
                        parent_label:"COMPONENT",
                        child:id,
                        child_label:"ARTIFACT",
                        properties:{

                        }
                    });
                });
                roots=roots.concat(com['root-artifacts']);
            }

            var rels=[];
            var roots=[];
            var nodes=[];
            _inspectComponent(com);
            function _createRelationship(rel,callback){
                var payload={
                    "statements":[
                        {
                            "statement":"match  (p:"+rel.parent_label+"{id:\""+rel.parent+"\"}) with p match (c:"+rel.child_label+"{id:\""+rel.child+"\"}) merge (p)-[:"+rel.type+"{"+  C.printProperties(rel.properties)+"}]->(c)"
                        }
                    ]
                };
                C.makeQuery(C.neo4j_server,url_neo4j,function(err,r,body){
                    if(err) {
                        errs.push(err);
                    }
                    callback(null);
                },'POST',payload);
            }

            function _createNode(node,callback){
                var payload={
                    "statements":[
                        {
                            "statement":"merge (:"+node.label+":"+node.properties.type+"{"+ C.printProperties(node.properties)+"}"+" )"
                        }
                    ]
                };
                C.makeQuery(C.neo4j_server,url_neo4j,function(err,r,body){
                    if(err) {
                        errs.push(err);
                    }
                    callback(null);
                },'POST',payload);
            }
            function _afterCreateAllNodes(err){
                async.each(rels,_createRelationship,_afterCreateAllRelationships);
            }
            function _afterCreateAllRelationships(err){
                callback(201);
            }

            async.each(nodes,_createNode,_afterCreateAllNodes);
        }


        var url = req.query.url;
        try {
            if (!url) {
                res.status(200).send({
                    'Message': 'Not provide url of nfvd component. Do nothing.'
                });
            } else {
                var errors = [];
                //var ret=N.com2Neo4j({},errors);
                //res.status(ret+0).send({
                //    'Message': 'Complete',
                //    'Errors':errors
                //});
                C.makeQuery('', url, function (err, r, body) {
                    if (err) {
                        console.log('collectNFVComponent return error:', err);
                        res.status(500).send({
                            headers: r.headers,
                            errors: err.toString(),
                            body:body
                        });
                        res.end();
                    } else {
                        if (COM.isComponents(body)) {
                            _com2Neo4j(body, errors,function(code){
                                res.status( code).send({
                                    'Message': 'Complete',
                                    'Errors': errors
                                });
                            });
                        } else {
                            res.status(200).send({
                                'Message': 'The url not return nfvd component. Do nothing.'
                            });
                            res.end();
                        }
                    }
                });
            }
        } catch (e) {
            console.log('eeee', e);
            res.status(500).send(e);
        }


    };

    N.initNeo4j=function(req,res){
        var payload = {
            "statements": [
                {"statement": "create constraint on (c:ARTIFACT) ASSERT c.id is unique"},
                {"statement": "create constraint on (c:COMPONENT) ASSERT c.id is unique"}
            ]
        };
        C.makeQuery(C.neo4j_server, url_neo4j, function (err, r, body) {
            if (err) {
                console.log({
                    headers: r.headers,
                    errors: body
                });
                res.status(500).send(err);
                res.end();
            } else {
                res.send({
                    message:'complete'
                });
                res.end();
            }
        }, 'POST', payload);
    };


    return N;
}());


