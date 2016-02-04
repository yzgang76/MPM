/**
 * Created by yanzhig on 9/4/2015.
 * libs for operations on NFVD v4 objects. like get ID from object
 */
module.exports = (function() {
    'use strict';
    var O = {};
    var path=require('path');
    var _ = require(path.join(__dirname,'/../node_modules/lodash/index'));

    //***********************************************************************
    // constant block
    //***********************************************************************
    var families=[
        {'org':'VDC','pretty':'Virtual DC'},
        {'org':'tenant','pretty':'Tenant'},
        {'org':'NETWORK','pretty':'Network'},
        {'org':'FIREWALL','pretty':'Firewall'},
        {'org':'LOADBALANCE','pretty':'Load Balance'},
        {'org':'VNF_COMPONENT','pretty':'VNF Component'},
        {'org':'VIRTUAL_MACHINE','pretty':'Virtual Machine'},
        {'org':'datacenter','pretty':'Data Center'},
        {'org':'network','pretty':'Network'},
        {'org':'virtual_network','pretty':'Virtual Network'},
        {'org':'physical_network','pretty':'Physical Network'},
        {'org':'external_network','pretty':'External Network'},
        {'org':'firewall','pretty':'Firewall'},
        {'org':'loadbalance','pretty':'Load Balance'},
        //{'org':'vnf_component','pretty':'VNF Component'},
        {'org':'vnf_component','pretty':'VAPP Component'},
        {'org':'vnf','pretty':'VAPP'},
        {'org':'vm','pretty':'VM'},
        {'org':'endpoint','pretty':'Endpoint'},
        {'org':'affinity_policy','pretty':'Affinity Policy'},
        {'org':'antiaffinity_policy','pretty':'Anti-Affinity Policy'},
        {'org':'range_policy','pretty':'Range Policy'},
        {'org':'virtual_machine','pretty':'Virtual Machine'}
    ];
    var transKey=[
        {'org':'vnf_component','pretty':'VAPP_DESIGNER.VAPP_COMPONENT'},
        {'org':'vnf','pretty':'VAPP_DESIGNER.VAPP'},
        {'org':'vm','pretty':'VAPP_DESIGNER.VM'},
        {'org':'endpoint','pretty':'VAPP_DESIGNER.ENDPOINT'},
        {'org':'affinity_policy','pretty':'VAPP_DESIGNER.AFFINITY_POLICY'},
        {'org':'antiaffinity_policy','pretty':'VAPP_DESIGNER.ANTI_AFFINITY_POLICY'},
        {'org':'range_policy','pretty':'VAPP_DESIGNER.RANGE_POLICY'},
        {'org':'virtual_machine','pretty':'VAPP_DESIGNER.VIRTUAL_MACHINE'}
    ];



    //***********************************************************************
    // functions for artifact
    //***********************************************************************

    var baseArtifact= O.artifact={};

    //Get ID of artifact
    baseArtifact.getID=function(obj){
        if(!obj){return undefined;}
        if(obj['@internal-id']){return obj['@internal-id'];}
        if(obj['internal-id']){return obj['internal-id'];}
        if(obj['@id']){return obj['@id'];}
        if(obj.id){return obj.id;}
        return undefined;
    };

    // get identifier of artifact
    baseArtifact.getIdentifier=function(obj){
        return obj?obj.identifier:undefined;

    };

    //get display name of artifact
    baseArtifact.getDisplayName=function(obj){
        if(obj.name) {return obj.name;}
        var general=baseArtifact.getCategoryGroup(obj,'GENERAL');
        if(general) {
            var n=baseArtifact.getGroupAttribute(general,'Name');
            if(n && n.value) {return n.value;}
        }
        var info=baseArtifact.getCategoryGroup(obj,'INFO');
        if(info) {
            var n1=baseArtifact.getGroupAttribute(info,'Name');
            if(n1 && n1.value) {return n1.value;}
        }
        var ident=  baseArtifact.getIdentifier(obj);
        if(ident) {return ident;}
        return baseArtifact.getFamily(obj)+'_'+baseArtifact.getID(obj);
    };

    //get family of artifact
    baseArtifact.getFamily=function(obj){
        if(!obj) {return undefined;}
        if(obj.type) {return obj.type;}  //TODO: artifact shall not have type
        var f= obj['artifact-definition']?obj['artifact-definition'].family:undefined;
        return f? f.toLowerCase():undefined;
    };
    baseArtifact.getCategory=function(obj){
        if(!obj) {return undefined;}
        var c= obj['artifact-definition']?obj['artifact-definition'].category:undefined;
        return c? c.toLowerCase():undefined;
    };

    //get version of artifact
    baseArtifact.getVersion=function(obj){  //TODO: update
        return obj?obj.version?obj.version:'':'';
    };
    //get create timestamp
    baseArtifact.getCreationTimestamp=function(obj){
        return obj?obj['creation-timestamp']:undefined;
    };
    //get update timestamp
    baseArtifact.getUpdateTimestamp=function(obj){
        return obj?obj['update-timestamp']:undefined;
    };
    baseArtifact.getState=function(art) {
        if (art) {
            return art.status['visible-label'];
        } else {
            return undefined;
        }
    };

    //get the category attribute group by cat
    baseArtifact.getCategoryGroup=function(obj,cat){
        try{
            return _.find(obj.categories,{label:cat});
        }catch(e){
            return undefined;
        }
    };

    // get attribute object from a attribute group
    baseArtifact.getGroupAttribute=function(group,attr){
        try{
            return _.find(group.attributes,{label:attr});
        }catch(e){
            return undefined;
        }

    };
    //get description
    baseArtifact.getDescription=function(obj){
        if(!obj) {return undefined;}
        if(obj.description) {return obj.description;}
        var general=baseArtifact.getCategoryGroup(obj,'GENERAL');
        if(general) {
            var n=baseArtifact.getGroupAttribute(general,'description');
            if(n) {return n.value;}
        }
        var info=baseArtifact.getCategoryGroup(obj,'INFO');
        if(info) {
            var n1=baseArtifact.getGroupAttribute(info,'description');
            if(n1) {return n1.value;}
        }
        return undefined;
    };


    // functions for VM artifact
    baseArtifact.getVMResource=function(resourceArtifact){
        try{
            var group=baseArtifact.getCategoryGroup(resourceArtifact,'INFO');
            var attr=baseArtifact.getGroupAttribute(group,'Amount');
            return {
                value:attr.value||0,
                unit:attr.unit
            };
        }catch(e){
            return 0;
        }
    };
    // end functions for VM artifact


    //***********************************************************************
    // functions for artifact
    //***********************************************************************

    var arr={};
    arr.getParentsByRelationshipAndFamily=function(nodeID,artifacts,relationships,parentFamily,relationship){
        //console.debug('getParentsByRelationshipAndFamily');
        try{
            var parents=_.filter(relationships,function(r){
                return (relationship?r['relationship-type']===relationship:true) && (r['child-artifact-id']===nodeID);
            });
            return _.filter(artifacts,function(a){
                return (parentFamily?baseArtifact.getFamily(a)===parentFamily:true) && (_.find(parents,{'parent-artifact-id': baseArtifact.getID(a)})!==undefined);
            });
        }catch(e){
            console.error("[getParentsByRelationshipAndFamily] :"+ e.message);
            return [];
        }
    };

    // find artifact by ID
    arr.getArtifactByID=function(artifacts,id){
        return _.find(artifacts,function(art){
            return baseArtifact.getID(art)===id;
        });
    };

    // find children artifact by the family
    arr.getChildArtifactByChildFamily=function(artifacts,relationships,parentID,childFamily){
        var rels=_.filter(relationships,{'parent-artifact-id':parentID});
        var ret=[];
        _.forEach(rels,function(rel){
            var child=arr.getArtifactByID(artifacts,rel['child-artifact-id']);
            if(child){
                ret.push(child);
            }
        });
        return _.filter(ret,function(r){
            return baseArtifact.getFamily(r)===childFamily;
        });
    };

    //***********************************************************************
    // functions for artifact
    //***********************************************************************
    var component= O.component={};

    //get component id
    component.getComponentID=function(com){
        if(_.has(com,'@internal-id')){return com['@internal-id'];}
        if(_.has(com,'id')){return com.id;}
        return undefined;
    };
    //get component name
    component.getComponentName=function(com){
        if(!com||!com.name) {return undefined;}
        return com.name;
    };
    component.getComponentURI=function(com){
        if(!com){ return undefined;}
        if(_.has(com,'@uri')){return com['@uri'];}
        if(_.has(com,'uri')){return com.uri;}
    };
    //get create timestamp of component or the first root artifact
    component.getComponentCreationTimestamp=function(com){
        var date=baseArtifact.getCreationTimestamp(com);
        if(date){
            return date;
        }else{
            var art=component.getComponentRootArtifact(com,0);
            if(art){
                return baseArtifact.getCreationTimestamp(art);
            }else{
                return '';
            }
        }
    };
    //get create timestamp of component or the first root artifact
    component.getComponentUpdateTimestamp=function(com){
        var date=baseArtifact.getUpdateTimestamp(com);
        if(date){
            return date;
        }else{
            var art=component.getComponentRootArtifact(com,0);
            if(art){
                return baseArtifact.getUpdateTimestamp(art);
            }else{
                return '';
            }
        }
    };
    // get component type - in lower case
    component.getComponentType=function(com){
        //console.log('ttttttttttttttttttttttttttttttttttt');
        try{
            var type= com.type.toLowerCase();
            if(type==='vnf'){
                if(component.isFirewallComponent(com)){
                    type='firewall';
                }else if(component.isLoadBalanceComponent(com)){
                    type='loadbalance';
                }
            }
            return type;
        }catch(e){
            return undefined;
        }
    };
    // get component version
    component.getComponentVersion=function(com){  //TODO: update
        return baseArtifact.getVersion(com);
    };
    // get description of component
    component.getComponentDescription=function(com){
        return com?com.description:undefined;
    };
    component.getComponentQuota=function(/*com*/){  //TODO: update
        return {
            vCore:4,
            vMem:'2048MB',
            vDisk:'1024GB'
        };
    };
    // get the state of component or the first root artifact
    component.getComponentState=function(com){
        try{
            return com.status['visible-label'];
        }catch(e){
            return baseArtifact.getState(component.getComponentRootArtifact(com,0));
        }
    };
    // return if the object is a component
    component.isComponents=function(com){
        return _.has(com,'subtemplates')||_.has(com,'subinstances');
    };
    // if the object is template component
    component.isTemplate=function(com){
        if(!com){return false;}
        if(_.has(com,'source-template')){
            return false;
        }else{
            return !_.has(com,'template-id');
        }
    };
    component.getSubComponents=function(com){
        if(!com){return [];}
        if(_.has(com,'subtemplates')){return com.subtemplates;}
        if(_.has(com,'subinstances')){return com.subinstances;}
        return [];
    };
    component.findComponentByID=function(com,id){
        var ret;
        if(component.getComponentID(ret)===id){
            return com;
        }
        _.forEach(component.getSubComponents(com),function(sub){
            if(component.findComponentByID(sub)){
                ret=sub;
            }
        });
        return ret;
    };
    //functions for types
    component.isVAPPComponent=function(com){
        var family= component.getComponentType(com);
        if(family==='vapp'){
            return true;
        }
        if(family==='vnf'){
            var rootArtifact=component.getComponentRootArtifact(com,0);
            if(rootArtifact){
                var f=baseArtifact.getFamily(rootArtifact);
                var c=baseArtifact.getCategory(rootArtifact);
                return (f==='vnf'&&c==='generic');
            }
        }
        return false;
    };
    component.isFirewallComponent=function(com){
        var type=com.type.toLowerCase();  // can't call getComponentType()!!!!
        if(type==='fw'||type==='firewall'){
            return true;
        }
        if(type==='vnf'){
            var rootArtifact=component.getComponentRootArtifact(com,0);
            if(rootArtifact){
                var f=baseArtifact.getFamily(rootArtifact);
                var c=baseArtifact.getCategory(rootArtifact);
                return (f==='vnf'&&(c==='fw'||c==='firewall'));
            }
        }
        return false;
    };
    component.isLoadBalanceComponent=function(com){
        var type= com.type.toLowerCase();// can't call getComponentType()!!!!
        if(type==='lb'||type==='loadbalance'){
            return true;
        }
        if(type==='vnf'){
            var rootArtifact=component.getComponentRootArtifact(com,0);
            if(rootArtifact){
                var f=baseArtifact.getFamily(rootArtifact);
                var c=baseArtifact.getCategory(rootArtifact);
                return (f==='vnf'&&(c==='lb'||c==='loadbalance'));
            }
        }
        return false;
    };
    component.isVNFCComponent=function(com){
        var family= component.getComponentType(com);
        return (family==='vnf_component');
    };
    component.isVMComponent=function(com){
        var family= component.getComponentType(com);
        return (family==='virtual_machine'||family==='vm');
    };
    component.isNetworkComponent=function(com){
        var family= component.getComponentType(com);
        return (family==='network'||family==='virtual_network'||family==='physical_network'||family==='external_network');
    };

    //added by Ellen zhou on 2015-10-20
    component.isExternalConnector=function(com){
        return  component.getComponentType(com)==='external';
    };
    component.isVDCNetwork=function(com){  //TODO: shall use isNetwork
        var type= component.getComponentType(com);
        return (type==='virtual_network' || type==='physical_network' ||type==='external_network');
    };
    component.isVLLink=function(com){  //TODO: move to baseArtifact Group
        return  baseArtifact.getFamily(com).toLowerCase()==='virtual_link';
    };

    component.isEndPoint=function(com){ //TODO: move to baseArtifact Group
        return  baseArtifact.getFamily(com).toLowerCase()==='vnf_endpoint';
    };

    component.isEndPointArt=function(com){ //TODO: move to baseArtifact Group
        return  baseArtifact.getFamily(com).toLowerCase()==='endpoint';
    };


    // if a artifact is in the component
    component.componentHasArtifact=function(com,artid){
        try{
            var arts=component.getComponentArtifactFlattenList(com).artifacts;
            return _.find(arts,function(art){
                    return baseArtifact.getID(art)===artid;
                })!==undefined;
        }catch(e){
            return false;
        }
    };


    //vapp functions
    // if vapp is deployed
    component.isVappDeployed=function(vapp){  //Todo: update
        return component.getComponentState(vapp)==='ACTIVE';
    };
    component.isVappConnected=function(vapp){
        var cons=component.getConnectionsOfVapp(vapp);
        return cons.length>0;
    };
    component.getComponentConnectors=function(com){  //TODO: Discard
        try{
            var cons= _.filter(com['component-info'].connectors,function(con){
                return con.type==='EXTERNAL';
            });
            var fob= component.getComponentArtifactFlattenList(com);
            var arts=fob.artifacts;
            var rels=fob.relationships;


            var connectors=[];
            _.forEach(cons,function(con){
                var ids=con['artifact-ids'];
                _.forEach(ids,function(id){
                    var ob=_.find(arts,function(art){
                        return  baseArtifact.getID(art)===id;
                    });
                    if(ob){
                        var vm= arr.getParentsByRelationshipAndFamily(baseArtifact.getID(ob),arts,rels,'virtual_machine','USES');
                        var vnfc;
                        if(vm&&vm.length>0){
                            vnfc=arr.getParentsByRelationshipAndFamily(baseArtifact.getID(vm[0]),arts,rels,'vnf_component','INCLUDE');
                        }
                        var cc={
                            vnfcID:vnfc?vnfc.length>0?baseArtifact.getID(vnfc[0]):undefined:undefined,
                            vnfcName:vnfc?vnfc.length>0?baseArtifact.getDisplayName(vnfc[0]):undefined:undefined,
                            vmId:vm?vm.length>0?baseArtifact.getID(vm[0]):undefined:undefined,
                            vmName:vm?vm.length>0?baseArtifact.getDisplayName(vm[0]):undefined:undefined,
                            id:baseArtifact.getID(ob),
                            name:baseArtifact.getDisplayName(ob),
                            type:baseArtifact.getFamily(ob),
                            description:baseArtifact.getDescription(ob)
                        };
                        //console.log('11111111111111111111',cc);
                        connectors.push(cc);
                    }else{
                        console.error('Not found connector ', id, ' in ',component.getComponentName(com));
                    }
                });

            });
            return connectors;
        }catch(e){
            console.error('getComponentConnectors error:', e.message);
            return [];
        }
    };
    component.getVMComponents=function(com){   //from vapp
        var type=component.getComponentType(com);
        switch(type){
            case 'vnf':
            case 'vapp':
            case 'firewall':
            case 'loadbalance':
                var vms=[];
                var vnfcs=component.getSubComponents(com);
                _.forEach(vnfcs,function(vnfc){
                    vms= _.union(vms, _.filter(component.getSubComponents(vnfc),function(subc){
                        return component.isVMComponent(subc);
                    }));
                });
                return vms;
            default:
                return [];

        }

    };

    // convert v4 components to v3 list structure

    component.getComponentArtifactFlattenList=function(com){
        //console.log('*****************************************', com.name);
        function _getArtifactFlattenList(coms){
            if(!coms){
                return;
            }
            //console.log('1111111111111111111111111',coms.length,arts.length,rels.length);

            _.forEach(coms,function(com){
                var ars=component.getComponentImmediateArtifacts(com);
                _.forEach(ars,function(ar){
                    ar.componentID=component.getComponentID(com);
                    ar.componentType=component.getComponentType(com);
                    ar.componentName=component.getComponentName(com);
                });
                //arts.push(ars);
                //console.log('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',arts,ars);
                arts= _.union(arts,ars);
                //console.log('baaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa2',arts);
                //rels.push(component.getComponentImmediateRelationships(com));
                rels= _.union(rels,component.getComponentImmediateRelationships(com));

                //arts= _.uniq(_.flatten(arts));
                //rels= _.uniq(_.flatten(rels));
                _getArtifactFlattenList(component.getSubComponents(com));
            });

        }
        var arts=[];
        var rels=[];

        if(!com) {
            return {
                artifacts: arts,
                relationships: rels
            };
        }
        //arts= _.cloneDeep(component.getComponentImmediateArtifacts(com));
        arts=component.getComponentImmediateArtifacts(com);
        _.forEach(arts,function(art){
            art.componentID=component.getComponentID(com);
            art.componentType=component.getComponentType(com);
            art.componentName=component.getComponentName(com);
        });
        //rels=_.cloneDeep(component.getComponentImmediateRelationships(com));
        rels=component.getComponentImmediateRelationships(com);
        //_getArtifactFlattenList(_.cloneDeep(component.getSubComponents(com)),arts,rels);
        _getArtifactFlattenList(component.getSubComponents(com),arts,rels);
        //console.log('1*****************************************',arts.length,rels.length);
        return {
            artifacts: arts, //_.uniq(_.flattenDeep(arts)),
            relationships:rels //_.uniq(_.flattenDeep(rels))
        };
    };

    // functions to get component attributes/subojbects
    component.getComponentImmediateArtifacts=function(com){
        if(com['artifact-templates']) {return com['artifact-templates'];}
        if(com['artifact-instances']) {return com['artifact-instances'];}
        return [];
    };
    component.getComponentImmediateRelationships=function(com){
        if(com['relationship-templates']) {return com['relationship-templates'];}
        if(com['relationship-instances']) {return com['relationship-instances'];}
        return [];
    };
    component.getComponentRootArtifactIDs=function(com){
        return com?com['root-artifacts']?com['root-artifacts']:undefined:undefined;
    };
    component.getComponentRootArtifact=function(com, index){
        var ids=  component.getComponentRootArtifactIDs(com);
        if(index<ids.length){
            var id=ids[index];
            var arts=component.getComponentImmediateArtifacts(com);
            return _.find(arts, function(art){
                return baseArtifact.getID(art)===id;
            });
        }else{
            return undefined;
        }
    };
    component.getComponentResourceInfo=function(com){
        try{
            var obj=component.getComponentArtifactFlattenList(com);
            var vCores=_.filter(obj.artifacts,function(art){
                return baseArtifact.getFamily(art)==='virtual_core';
            });

            var vCoreResource={
                value:0,
                unit:'core'
            };
            _.forEach(vCores,function(vCore){
                var resource=baseArtifact.getVMResource(vCore);
                vCoreResource.value=parseInt(vCoreResource.value)+parseInt(resource.value);
                vCoreResource.unit=resource.unit;
            });

            var vMemories=_.filter(obj.artifacts,function(art){
                return baseArtifact.getFamily(art)==='virtual_memory';
            });
            var vMemoryResource={
                value:0,
                unit:''
            };
            _.forEach(vMemories,function(vmem){
                var resource=baseArtifact.getVMResource(vmem);
                vMemoryResource.value=parseInt(vMemoryResource.value)+parseInt(resource.value);
                vMemoryResource.unit=resource.unit;   //hoep they are use the same unit
            });


            var vDisks=_.filter(obj.artifacts,function(art){
                return baseArtifact.getFamily(art)==='virtual_disk';
            });
            var vDiskResource={
                value:0,
                unit:''
            };
            _.forEach(vDisks,function(vDisk){
                var resource=baseArtifact.getVMResource(vDisk);
                vDiskResource.value=parseInt(vDiskResource.value)+parseInt(resource.value);
                vDiskResource.unit=resource.unit;
            });


            return{
                vCore:vCoreResource,
                vMem:vMemoryResource,
                vDisk:vDiskResource
            };

        }catch(e){
            return undefined;
        }
    };

    // others
    component.getPrettyFamily=function(family){
        //console.warn('getPrettyFamily:',family);
        var f=_.find(families,{'org':family});
        if(f){
            return f.pretty;
        }else {
            return family;
        }
    };
    component.getTransKey=function(family){
        //console.warn('getPrettyFamily:',family);
        var f=_.find(transKey,{'org':family});
        if(f){
            return f.pretty;
        }else {
            return family;
        }
    };
    component.getOrgFamily=function(family){
        var f=_.find(families,{'pretty':family});
        if(f){
            return f.org;
        }else {
            return family;
        }
    };
    component.getUniComponentTypeName = function(com){
        if (component.isVMComponent(com)) {
            return "virtual_machine";
        } else if (component.isNetworkComponent(com)) {
            return "network";
        } else if (component.isVAPPComponent(com)) {
            return "vapp";
        } else if (component.isFirewallComponent(com)) {
            return "firewall";
        } else if (component.isLoadBalanceComponent(com)) {
            return "loadbalance";
        }
    };
    /*
     function _getSubComponentByID(coms,subID){
     var c= _.find(coms,function(com){
     return component.getComponentID(com)===subID;
     });
     if(c){
     return c;
     }else{
     var cc=[];
     _.forEach(coms,function(com){
     var sob=component.getSubComponents(com);
     if(sob&&sob.length>0){
     if(cc){
     return cc;
     }else{
     cc=_getSubComponentByID(sob,subID);
     }
     }
     });
     return cc;
     }
     }
     component.getSubComponentByID=function(com,subID){
     if(component.getComponentID(com)===subID){
     return com;
     }
     return _getSubComponentByID(component.getSubComponents(com),subID);
     };
     component.isOneOfComponentRootArtifact=function(com,rootid){
     var ids=component.getComponentRootArtifactIDs(com);
     return _.find(ids,function(id){
     return id===rootid;
     })!==undefined;
     };
     function _getSubComponentByRootID(coms,subID){
     var c= _.find(coms,function(com){
     return component.isOneOfComponentRootArtifact(com,subID);
     });
     if(c){
     return c;
     }else{
     var cc;
     _.forEach(coms,function(com){
     var sob=component.getSubComponents(com);
     if(sob&&sob.length>0){
     if(cc){
     return cc;
     }else{
     cc=_getSubComponentByRootID(sob,subID);
     }
     }
     });
     return cc;
     }
     }
     component.getSubComponentByRootID=function(com,subID){
     if(component.isOneOfComponentRootArtifact(com,subID)){
     return com;
     }
     var ret= _getSubComponentByRootID(component.getSubComponents(com),subID);
     return ret;
     };*/

    //vdc functions
    component.getVAPPsFromVDCInstance=function(com){
        if(!com) {
            return [];
        }
        return _.filter(component.getSubComponents(com), function(subc){
            return component.isVAPPComponent(subc);
        });
    };
    // reformat vdc for vdc manager graph
    component.reformatVDCInstance=function(com){
        //var startTime=new Date().getTime();
        if(!com) {
            return {};
        }

        var subs=component.getSubComponents(com);
        //console.log('-------------------------------0',new Date().getTime()-startTime+0);
        var ret= {};//_.cloneDeep(com);
        //console.log('-------------------------------1',new Date().getTime()-startTime+0);
        ret.networks=[];
        ret.vms=[];
        ret.fws=[];
        ret.lbs=[];



        _.forEach(subs,function(subc){
            if(component.isNetworkComponent(subc)){
                ret.networks.push(subc);
            }else if(component.isFirewallComponent(subc)){
                ret.fws.push(subc);
            }else if(component.isLoadBalanceComponent(subc)){
                ret.lbs.push(subc);
            }

        });
        //console.debug('reformatVDCInstance cost: ',new Date().getTime()-startTime);
        //console.log('-------------------------------2',new Date().getTime()-startTime+0);
        return ret;
    };
    //get endpoint sub components
    component.getEndpointsOfVapp=function(vappInstance){

        var subs=component.getSubComponents(vappInstance);
        return _.filter(subs,function(sub){
            return component.getComponentType(sub)==='endpoint';
        });
    };
    //get relationships of all endpoint components
    component.getConnectionsOfVapp=function(vappInstance){
        var cons=component.getEndpointsOfVapp(vappInstance);
        var ret=[];

        //filter relationship is 'TO_BE_DISCONNECTED'
        _.forEach(cons,function(con){
            ret= _.union(ret, _.filter(component.getComponentImmediateRelationships(con),function(rel){
                    //console.log('---------------------------',rel.status,baseArtifact.getState(rel));
                    return baseArtifact.getState(rel)!=='TO_BE_DISCONNECTED';
                })
            );
        });
        return _.uniq(ret);
    };
    // get connections as VM-Networks for vdc graph
    component.getVappConnections=function(vdcInstance,flattenVDC){
        try{
            //var startTime=new Date().getTime();

            var vapps=component.getVAPPsFromVDCInstance(vdcInstance);
            //var networks=component.getNetFromVdc(vdcInstance);

            //console.log('a-------------------------------0',new Date().getTime()-startTime+0);
            //var subs=component.getSubComponents(vdcInstance);
            //var ob={};
            //ob.subInstances=_.filter(subs, function(sub){
            //    return component.isNetworkComponent(sub)||component.isVAPPComponent(sub);
            //});

            var obj;
            if(!flattenVDC){
                obj=component.getComponentArtifactFlattenList(vdcInstance);
            }else{
                obj=flattenVDC;
            }
            //console.log('a-------------------------------1',new Date().getTime()-startTime+0,obj);
            var ret=[];
            _.forEach(vapps,function(vapp){
                var connectors={
                    vappID:component.getComponentID(vapp),
                    connections:[]
                };

                var connections=component.getConnectionsOfVapp(vapp);
                _.forEach(connections, function(connection){
                    var vle=connection['parent-artifact-id'];
                    var network=arr.getArtifactByID(obj.artifacts,vle).componentID;
                    var vnfe=connection['child-artifact-id'];
                    var vps=arr.getChildArtifactByChildFamily(obj.artifacts,obj.relationships,vnfe,'virtual_port');
                    //TODO: may not only apply on virtual_port
                    _.forEach(vps,function(vp){
                        connectors.connections.push({
                            networkID:network,
                            vmID:vp.componentID,   //vm id
                            type:connection['relationship-type'],
                            state:connection.status['visible-label']
                        });
                    });

                });
                ret.push(connectors);
            });
            //console.log('a-------------------------------2',new Date().getTime()-startTime+0);
            return ret;
        }catch(e){
            console.log('getVappConnections error: '+ e);
            return [];
        }

    };

    //com is a vdc component,
    //this function will find out all Networks in the VDC instance.
    //this function added by Ellen zhou on 2015/09/25
    component.getVDCNetworkConnects=function(com){
        var cons = _.filter(com['component-info'].connectors, function (con) {
            return component.isExternalConnector(con);
        });
        var subComs = component.getSubComponents(com);
        var networks=[];
        _.forEach(subComs, function (subCom) {
            if (component.isNetworkComponent(subCom)) {
                var network = {};
                network.name = subCom.name;
                network.netId = subCom['@internal-id'];
                network.availableConnectorId = [];
                networks.push(network);

                var fob = component.getComponentArtifactFlattenList(subCom);
                var arts = fob.artifacts;

                _.forEach(cons, function (con) {
                    var ids = con['artifact-ids'];
                    _.forEach(ids, function (id) {
                        var ob = _.find(arts, function (art) {  //TODO: double check
                            return baseArtifact.getID(art) === id;
                        });
                        if(ob){
                            network.availableConnectorId.push(id);
                        }
                    });

                });
            }
        });

        return networks;

    };

    component.getVDCNet=function(com){
        var subComs = component.getSubComponents(com);

        var networks = _.filter(subComs, function (subInst) {
            return component.isVDCNetwork(subInst);
        });

        var vdcNetworks=[];
        _.forEach(networks, function (netWork) {

            if (component.isComponentDeployed(netWork)){
                var vdcNet={};
                vdcNet.name=netWork.name;
                vdcNet.id= component.getComponentID(netWork);
                vdcNetworks.push(vdcNet);
            }

        });

        return vdcNetworks;
    };

    component.getVappEndPoint=function(com){
        var subComs = component.getSubComponents(com);
        var endpoints_art=_.filter(subComs, function (subInst) {
            return component.isEndPointArt(subInst);
        });
        var vappEndpoints=[];

        _.forEach(endpoints_art, function (endpoint_art) {
            var artifactInstances=component.getComponentImmediateArtifacts(endpoint_art);
            var endPoints= _.filter(artifactInstances, function (subInst) {
                return component.isEndPoint(subInst);
            });

            _.forEach(endPoints,function(ep){
                var vappEndpoint={};
                vappEndpoint.name=endpoint_art.name;
                vappEndpoint.endPointId= baseArtifact.getID(endpoint_art);
                vappEndpoint.ep={};
                vappEndpoint.ep.id=  baseArtifact.getID(ep);

                vappEndpoints.push(vappEndpoint);
            });
        });

        return vappEndpoints;

    };

    component.getVnfEndpointFromVdc = function(vdc,vnfId,instanceType){
        var vnfs = [];

        var isContinue = true;
        var subInstances1=component.getSubComponents(vdc);
        _.forEach(subInstances1, function (vnfInstances) {
         //   if(component.getComponentType(vnfInstances)=== 'vnf'){
                if(component.getComponentType(vnfInstances)=== instanceType){
                    if(vnfId){
                    isContinue=(vnfInstances.id===vnfId);
                    //if(vnfInstances.id!==vnfId){
                    //    isContinue = false;
                    //}
                    //else{
                    //    isContinue = true;
                    //}
                }
                else{
                    isContinue = true;
                }


                if(isContinue){
                    var vnf = {};
                    vnf.name = vnfInstances.name;
                    vnf.id = component.getComponentID(vnfInstances);
                    // vnf['@internal-id'] =component.getID()['@internal-id'];
                    vnf.endpoints = [];
                    var subInstances=component.getSubComponents(vnfInstances);
                    _.forEach(subInstances, function (endPointInstances) {
                            if( component.isEndPointArt(endPointInstances)){
                                var vnfEndPoint={};
                                vnfEndPoint.id  = endPointInstances.id;
                                vnfEndPoint.name=endPointInstances.name;
                                vnf.endpoints.push(vnfEndPoint);
                            }
                        }
                    );

                    vnfs.push(vnf);
                }

            }

        });

        return vnfs;
    };

    component.getNetFromVdc =  function(vdc, netId){
        var nets = [];

        var isContinue = true;
        var subComs = component.getSubComponents(vdc);

        _.forEach(subComs, function (netInstances) {
            if(component.isVDCNetwork(netInstances)){
                if(netId){
                    isContinue=netInstances.id!==netId;
                    //if(netInstances.id!==netId){
                    //    isContinue = false;
                    //}
                    //else{
                    //    isContinue = true;
                    //}
                }
                else{
                    isContinue = true;
                }

                if(isContinue){
                    var net = {};
                    net.name = netInstances.name;
                    net.id = netInstances.id;
                    net['@internal-id'] = netInstances['@internal-id'];
                    net.vlink = [];
                    _.forEach(netInstances['artifact-instances'], function (instances) {

                            if(instances['artifact-definition'].family === 'VL_ENDPOINT' && instances['artifact-definition'].category ==='IP'){

                                var vlEndPoint = {};
                                vlEndPoint.id = instances.id;
                                vlEndPoint['@internal-id'] = instances['@internal-id'];
                                net.vlink.push(vlEndPoint);
                            }

                        }
                    );

                    nets.push(net);
                }

            }

        });

        return nets;
    };

    component.buildResourceTreeFromVdc = function(vdc){

        //var relationships = vdc['relationship-instances'];

        var resource = _.find(vdc.subinstances,{"type": "resource_pool"});

        var resourcePool =  {};
        resourcePool.name = resource.name;
        resourcePool.id = resource['root-artifacts'][0];
        resourcePool.originaltype = resource.type;
        resourcePool.type = 'Resource Pool';
        resourcePool.child = [];


        function buildRegionToRZone(regions,artifactinstances,relationships){
            _.each(regions,function(region){
                //first find region item form intances
                _.each(artifactinstances,function(zone){

                    if(zone['artifact-definition'].family==='AVAILABILITY_ZONE'){

                        _.each(relationships,function(useRelationship){
                            if(useRelationship['relationship-type']==='DIVIDE'&& useRelationship['parent-artifact-id']===region.id){

                                var childId = useRelationship['child-artifact-id']; //child id is zone id

                                if(zone.id === childId){
                                    var zoneData = {};
                                    zoneData.name = zone.identifier;
                                    zoneData.id = zone.id;
                                    zoneData.type = 'Zone';
                                    zoneData.orgionalType = zone['artifact-definition'].family;
                                    zoneData.child = [];
                                    region.child.push(zoneData);
                                }
                            }
                        });
                    }
                });
            });
        }
        function buildVimToRegion(vims,artifactinstances,relationships){
            _.each(vims,function(vim){
                //first find region item form instance
                _.each(artifactinstances,function(region){

                    if(region['artifact-definition'].family==='REGION'){
                        //then go to relationships to find authentication parent

                        _.each(relationships,function(useRelationship){
                            if(useRelationship['relationship-type']==='USE'&& useRelationship['parent-artifact-id']===vim.id){

                                var authId = useRelationship['child-artifact-id']; //it is the AUTHENTICATION id

                                _.each(relationships,function(authRelationship){
                                    if(authRelationship['relationship-type']==='AUTHENTICATE'&& authRelationship['parent-artifact-id']===authId){

                                        if(authRelationship['child-artifact-id']===region.id){
                                            var regionData = {};
                                            regionData.name = region.identifier;
                                            regionData.id = region.id;
                                            regionData.type = 'Region';
                                            regionData.orgionalType = region['artifact-definition'].family;
                                            regionData.child = [];
                                            vim.child.push(regionData);
                                        }
                                    }
                                });

                                //then use AUTHENTICATION as parent id  to find region
                            }

                        });

                    }
                });
            });

        }


        var subinstances = resource.subinstances;

        _.each(subinstances,function(resourceChild){
            if(resourceChild.type === 'datacenter'){
                var datacenter = {};
                datacenter.name = resourceChild.name;
                datacenter.id = resourceChild['root-artifacts'][0];
                datacenter.type = 'DataCentre';
                datacenter.originaltype = resourceChild.type;
                datacenter.child = [];

                var datacenterRelationShips = resourceChild['relationship-instances'];

                var artifactInstances = resourceChild['artifact-instances'];

                _.each(artifactInstances,function(vimInstance){
                    if(vimInstance['artifact-definition'].family==='VIM'){
                        var vim = {};
                        vim.name = vimInstance.identifier;
                        vim.id = vimInstance.id;
                        vim.type = 'VIM';
                        vim.originaltype = vimInstance['artifact-definition'].family;
                        vim.child = [];
                        datacenter.child.push(vim);
                    }
                });

                buildVimToRegion(datacenter.child,artifactInstances,datacenterRelationShips);

                _.each(datacenter.child,function(vim){
                    buildRegionToRZone(vim.child,artifactInstances,datacenterRelationShips);

                });



                console.log(JSON.stringify(datacenter));

                resourcePool.child.push(datacenter);


            }

        });

        console.log(JSON.stringify(resourcePool));

        return resourcePool;

    };

    return O;
})();