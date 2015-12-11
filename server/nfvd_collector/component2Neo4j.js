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
        console.log("start to collect NFVD component....");
        function _com2Neo4j(com,callback) {
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
                var roots=com['root-artifacts'];
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
                    if(_.includes(roots,id)){
                        rels.push({
                            label:'HAS_ROOT',
                            parent:rootid,
                            parent_label:"COMPONENT",
                            child:id,
                            child_label:"ARTIFACT",
                            properties:{

                            }
                        });
                    }
                    _.forEach(art.categories,function(cg){
                        var cgid=id+"-"+cg.order;
                        nodes.push({
                            label:'CATEGORY_GROUP',
                            properties:{
                                id:cgid,
                                label:cg.label
                            }
                        });
                        rels.push({
                            label:'HAS_CATEGORY_GROUP',
                            parent:id,
                            parent_label:"ARTIFACT",
                            child:cgid,
                            child_label:"CATEGORY_GROUP",
                            properties:{

                            }
                        });
                        _.forEach(cg.attributes,function(attr){
                            var attrid=cgid+"-"+attr.order;
                            nodes.push({
                                label:'ATTRIBUTE',
                                properties:{
                                    id:attrid,
                                    label:attr.label,
                                    mandatory:attr.mandatory,
                                    value:attr.value||'',
                                    description:attr.description||'',
                                    attr_type:attr.type||'',
                                    unit:attr.unit||'',
                                    restrictions:attr.restrictions.length
                                }
                            });
                            if(attr.restrictions.length>0){
                                for(var i=0;i<attr.restrictions.length;i++){
                                    var tid=attrid+'-'+i;
                                    var r=attr.restrictions[i];
                                    nodes.push({
                                        label:'RESTRICTION',
                                        properties:{
                                            id:tid,
                                            visible:r.visible,//?r.visible.length>0?JSON.stringify(r.visible):'':'',
                                            values:r.values,//?r.values.length>0?JSON.stringify(r.values):'':'',
                                            restriction_type:r.type||''
                                        }
                                    });

                                    rels.push({
                                        label:'HAS_RESTRICTION',
                                        parent:attrid,
                                        parent_label:"ATTRIBUTE",
                                        child:tid,
                                        child_label:"RESTRICTION",
                                        properties:{

                                        }
                                    });
                                }
                            }
                            rels.push({
                                label:'HAS_ATTRIBUTE',
                                parent:cgid,
                                parent_label:"CATEGORY_GROUP",
                                child:attrid,
                                child_label:"ATTRIBUTE",
                                properties:{

                                }
                            });
                        });
                    });

                });
                _.forEach(COM.getComponentImmediateRelationships(com),function(rel){
                    rels.push({
                        label:rel['relationship-type'],
                        parent:rel['parent-artifact-id'],
                        parent_label:"ARTIFACT",
                        child:rel['child-artifact-id'],
                        child_label:"ARTIFACT",
                        properties:{
                            state:rel.status['visible-label']
                        }
                    });
                });
                _.forEach(COM.getSubComponents(com),function(sub){
                    _inspectComponent(sub,rootid);
                });
            }

            var rels=[];

            var nodes=[];
            _inspectComponent(com);


            function _createRelationship(rel,callback){
                //callback(null);
                var payload = {
                    "statements": [
                        {
                            "statement": "match  (p:" + rel.parent_label + "{id:\"" + rel.parent + "\"}) with p match (c:" + rel.child_label + "{id:\"" + rel.child + "\"}) merge (p)-[:" + rel.label + "{" + C.printProperties(rel.properties) + "}]->(c)"
                        }
                    ]
                };
                C.makeQuery(C.neo4j_server, url_neo4j, function (err, r, body) {
                    if (err) {
                        errors.push(err);
                    }
                    if(body.errors.length>0){
                        errors=errors.concat(body.errors);
                    }
                    callback(null);
                }, 'POST', payload);
            }

            function _createNode(node,callback){
                var payload={
                    "statements":[
                        {
                            "statement":node.properties.type?"merge (:"+node.label+":"+node.properties.type+"{"+ C.printProperties(node.properties)+"}"+" )":"merge (:"+node.label+"{"+ C.printProperties(node.properties)+"}"+" )"
                        }
                    ]
                };
                C.makeQuery(C.neo4j_server, url_neo4j, function (err, r, body) {
                    if (err) {
                        errors.push(err);
                    }

                    if(body.errors.length>0){
                        errors=errors.concat(body.errors);
                    }
                    callback(null);
                }, 'POST', payload);
            }
            function _afterCreateAllNodes(err){

                console.log('complete create nodes. start to create relationships... ');

                async.each(rels,_createRelationship,_afterCreateAllRelationships);
            }
            function _afterCreateAllRelationships(err){
                console.log("complete collect nfvd component");
                console.log('********************** total node: ', nodes.length);
                _.forIn(_.groupBy(nodes,function(n){
                    return n.label;
                }),function(v,k){
                    console.log(k+":"+ v.length);
                });
                console.log('********************** ');
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
                //var results=[];
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
                            _com2Neo4j(body, function(code){
                                res.status( code).send({
                                    'Message': 'Complete',
                                    'Errors': errors
                                    //'Results':results
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
                {"statement": "create constraint on (c:COMPONENT) ASSERT c.id is unique"},
                {"statement": "create constraint on (c:CATEGORY_GROUP) ASSERT c.id is unique"},
                {"statement": "create constraint on (c:ATTRIBUTE) ASSERT c.id is unique"},
                {"statement": "create constraint on (c:RESTRICTION) ASSERT c.id is unique"}

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


