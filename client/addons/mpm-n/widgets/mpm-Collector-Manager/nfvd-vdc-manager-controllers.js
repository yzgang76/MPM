define([
        'angular',
        'lodash',
        'addons/nfvd/modules/nfvd-rappid/nfvd-rappid-shapes',
        './lib/nfvd-rappid-vdc',
        'jquery',
        'joint',
        'backbone',
        'addons/nfvd/modules/nfvd-lib/comm-lib',
        'addons/nfvd/modules/nfvd-lib/nfvd-object-orient',
        'commons/events/commons-events',
        'components/data-exchange/data-exchange-services',
        'addons/nfvd/bower_components/bootstrap-select/dist/js/bootstrap-select.min',
        'addons/nfvd/modules/nfvd-data-access/nfvd-data-access-services',
        //'addons/nfvd/modules/nfvd-module/nfvd-module-services',
        //'addons/nfvd/modules/nfvd-user/nfvd-user-services',
        'components/message-notifier/message-notifier-services',
        'css!addons/nfvd/bower_components/bootstrap-select/dist/css/bootstrap-select.min',
        'addons/nfvd/modules/nfvd-jobs/nfvd-jobs-services',
        'addons/nfvd/widgets/nfv-artifact-display/actionMenu/nfv-action-modal-controller-define',
        'addons/nfvd/widgets/nfv-artifact-display/actionMenu/nfv-action-exemethod-define'
    ],
    function(angular,_, SHAPES, VDC,  $, joint,Backbone, C,O) {
        'use strict';
        var vdcmngrWidgetControllers = angular.module('vdcmngrWidgetControllers', [ 'commonsEvents','nfvdDataAccessServices','dataExchangeServices',
                                        'nfvdModuleServices', 'nfvdJobsServices', 'nfvdActionModalDefineApp', 'nfvdActionExeMethodApp']);

        vdcmngrWidgetControllers.controller('vdcmngrWidgetController', [
            '$rootScope',
            '$scope',
            '$log',
            '$compile',
            '$translate',
            '$http',
            '$window',
            '$timeout',
            '$modal',
            'events',
            'nfvdDataAccessService',
            'dataExchangeService',
            'messageNotifierService',
            'nfvdJobsService',
            'actionModalCtlDefine',
            'actionExeMethodDefine',
            function($rootScope, $scope, $log, $compile, $translate, $http, $window, $timeout, $modal, events, dataAccessService, dataExchangeService,
                     messageNotifierService, nfvdJobsService, actionModalCtlDefine, actionExeMethodDefine) {
                var logger = $log.getInstance('vdcmngrWidgetControllers');

                logger.debug('User Info: ',$rootScope.nfvdUser);
                //variables in $Scope
                var COMPONENT= O.component;
                var CONSTANT=O.constant;
                $scope.curVdcID=dataExchangeService.getData('vdcId');
                $scope.curVAPPGroupID=dataExchangeService.getData('vappGroupId')||$rootScope.nfvdUser.groups[0].vnfGroupId;
                $scope.isShowAllVapp=false;
                var d=$scope.d={};
                d.componentForConnect=undefined;
                d.componentIDOfConnectors=undefined;
                d.componentNameOfConnectors=undefined;
                d.componentConnectors=[];  //store all planned connector information, pass to deploy dialog
                $scope.order="-name";

                var unselect_event='UNSELECTED';
                //init layout
                $('.selectpicker').selectpicker();
                $('#checkall').click(
                    function(){
                        if(this.checked){
                            $('input[name="checkname"]').each(function(){this.checked=true;});
                        }else{
                            $('input[name="checkname"]').each(function(){this.checked=false;});
                        }
                    }
                );
                $('.titleGlobal').each(function(i) {
                    $(this).click(function(){
                        var o=$('.elements');
                        var odiv = o.eq(i).get(0);
                        if($(odiv).css('display') === '' || $(odiv).css('display') === 'none'){
                            o.slideUp(300).eq(i).slideDown(300);
                            $('.titleGlobal').addClass('collect').eq(i).removeClass('collect');
                        }
                    });
                });
                $('.nfvd_c_actionShowBtn').click(function(){
                    $('.nfvd_c_actionBtnCon').slideToggle(300);
                });
                $('.nfvd_c_right-tab-y .nfvd_c_tab-rotate').each(function(i) {
                    $(this).click(function(){
                        var o=$('.nfvd_c_left-display-con-border');
                        var odiv = o.eq(i).get(0);
                        if($(odiv).css('display') === '' || $(odiv).css('display') === 'none'){
                            o.slideUp(300).eq(i).slideDown(300);
                            $('.nfvd_c_right-tab-y .nfvd_c_tab-rotate').removeClass('selected').eq(i).addClass('selected');
                        }
                    });
                });
                $(window).resize(function() {
                    var vdcIMwidth = $('.nfvd_c_VdcIM').width();
                    if(vdcIMwidth<1380) {
                        $('.nfvd_c_maxWidth').css({'width':'40px','overflow':'hidden','height':'28px;'});
                    }else{
                        $('.nfvd_c_maxWidth').css({'width':'auto','height':'28px;'});
                    }
                }).resize();

                $('#nfvd_c_arrow_leftBar_Hide').click(function(){
                    $(this).hide();
                    $('.nfvd_c_leftBar').hide();
                    $('#nfvd_c_arrow_leftBar_Show').show();
                    $('.nfvd_c_mainCon').css({'padding-left':'0'});
                });
                $('#nfvd_c_arrow_leftBar_Show').click(function(){
                    $(this).hide();
                    $('.nfvd_c_leftBar').show();
                    $('#nfvd_c_arrow_leftBar_Hide').show();
                    $('.nfvd_c_mainCon').css({'padding-left':'240px'});
                });
                $('#nfvd_c_arrow_rightBar_Hide').click(function(){
                    $(this).hide();
                    $('.nfvd_c_rightBar').hide();
                    $('#nfvd_c_arrow_rightBar_Show').show();
                    $('.nfvd_c_mainCon').css({'padding-right':'0'});
                    $('#nfvd_c_leftWide').hide();
                    $('#nfvd_c_rightNarrow').hide();
                    $('.nfvd_c_treeArea').hide();
                    $('.nfvd_c_rightBar .nfvd_c_treeArea').css({'width':'476px'});
                    $('.nfvd_c_rightBar .nfvd_c_inspector_inputbox_Area').css({'width':'276px'});
                });
                $('#nfvd_c_arrow_rightBar_Show').click(function(){
                    $(this).hide();
                    $('.nfvd_c_rightBar').show().css({'width':'340px'});
                    $('#nfvd_c_arrow_rightBar_Hide').show();
                    $('.nfvd_c_mainCon').css({'padding-right':'340px'});
                    $('#nfvd_c_leftWide').show();
                    $('.nfvd_c_mouse').show();
                    $('.nfvd_c_inputboxArea').show();
                    $('.nfvd_c_rightBar .nfvd_c_treeArea').css({'width':'298px'});
                    $('.nfvd_c_rightBar .nfvd_c_inspector_inputbox_Area').css({'width':'298px'});
                });
                $('#nfvd_c_leftWide').click(function(){
                    $(this).hide();
                    $('.nfvd_c_mainCon').css({'padding-right':'800px'});
                    $('.nfvd_c_rightBar').css({'width':'800px'});
                    $('#nfvd_c_rightNarrow').show();
                    $('.nfvd_c_inputboxArea').show();
                    $('.nfvd_c_treeArea').show();
                    $('.nfvd_c_inputboxArea .nfvd_c_mouse').hide();
                    $('.nfvd_c_treeArea .nfvd_c_mouse').hide();
                    $('.nfvd_c_treeArea .nfvd_c_return_inputboxarea').hide();
                    $('.nfvd_c_rightBar .nfvd_c_treeArea').css({'width':'476px'});
                    $('.nfvd_c_rightBar .nfvd_c_inspector_inputbox_Area').css({'width':'276px'});
                    $('.nfvd_c_filter_input').css({'width':'692px'});
                    $('.nfvd_c_rightBar .nfvd_c_left-display-con-border .nfvd_c_vAPPelements li label a').css({'width':'600px'});
                });
                $('#nfvd_c_rightNarrow').click(function(){
                    $(this).hide();
                    $('#nfvd_c_leftWide').show();
                    $('.nfvd_c_mainCon').css({'padding-right':'340px'});
                    $('.nfvd_c_rightBar').css({'width':'340px'});
                    $('.nfvd_c_treeArea').hide();
                    $('.nfvd_c_inputboxArea .nfvd_c_mouse').show();
                    $('.nfvd_c_treeArea .nfvd_c_mouse').show();
                    $('.nfvd_c_treeArea .nfvd_c_return_inputboxarea').show();
                    $('.nfvd_c_rightBar .nfvd_c_treeArea').css({'width':'298px'});
                    $('.nfvd_c_rightBar .nfvd_c_inspector_inputbox_Area').css({'width':'298px'});
                    $('.nfvd_c_filter_input').css({'width':'232px'});
                    $('.nfvd_c_rightBar .nfvd_c_left-display-con-border .nfvd_c_vAPPelements li label a').css({'width':'140px'});
                });
                var getInnerHeight = function() {
                    return window.innerHeight || document.documentElement.clientHeight;
                };
                $(window).resize(function() {
                    $('.nfvd_c_right-display-con-border').height(getInnerHeight()-253);
                    $('.nfvd_c_left-display-con-border').height(getInnerHeight()-433);
                    $('.nfvd_c_midBar').height(getInnerHeight()-253);
                    $('.nfvd_c_left-tab-y').height(getInnerHeight()-253);
                    $('.nfvd_c_right-tab-y').height(getInnerHeight()-253);
                    $('.nfvd_c_vAPPelements').height(getInnerHeight()-475);
                    $('.nfvd_c_vAPPelements_l').height(getInnerHeight()-295);
                    $('.nfvd_c_vdc_inspector').height(getInnerHeight()-475);
                    $('.nfvd_c_rightBar .nfvd_c_inspector_inputbox_Area').height(getInnerHeight()-483);
                    $('.nfvd_c_rightBar .nfvd_c_treeArea').height(getInnerHeight()-493);
                    //logger.debug('Height=',getInnerHeight());
                }).resize();
                var isShow = false;
                $('.nfvd_c_sort').click(function() {
                    if(!isShow) {
                        $('.nfvd_c_sortbox').slideDown(300);
                    } else {
                        $('.nfvd_c_sortbox').slideUp(300);
                    }
                    isShow = !isShow;
                });
                $('.nfvd_c_midBar').click(function(){
                    if(isShow){
                        $('.nfvd_c_sortbox').slideUp(300);
                    }
                    isShow = !isShow;
                });
                $('.nfvd_c_leftBar').click(function(){
                    if(isShow){
                        $('.nfvd_c_sortbox').slideUp(300);
                    }
                    isShow = !isShow;
                });
                $('.nfvd_c_vAPPelements').click(function(){
                    if(isShow){
                        $('.nfvd_c_sortbox').slideUp(300);
                    }
                    isShow = !isShow;
                });
                $('.nfvd_c_VdcIM').click(function(){
                    if(isShow){
                        $('.nfvd_c_sortbox').slideUp(300);
                    }
                    isShow = !isShow;
                });

                $scope.sortNameClick=function(){
                    $('#nfvd_sort_status').removeClass('nfvd_c_sort_up').addClass('nfvd_c_sort_down');
                    $('#nfvd_sort_time').removeClass('nfvd_c_sort_up').addClass('nfvd_c_sort_down');
                    if($('#nfvd_sort_name').attr('class')==='nfvd_c_sort_down'){
                        $scope.order='+name';
                        $('#nfvd_sort_name').removeClass('nfvd_c_sort_down').addClass('nfvd_c_sort_up');
                    }else{
                        $scope.order='-name';
                        $('#nfvd_sort_name').removeClass('nfvd_c_sort_up').addClass('nfvd_c_sort_down');
                    }
                };
                $scope.sortStatusClick=function(){
                    $('#nfvd_sort_name').removeClass('nfvd_c_sort_up').addClass('nfvd_c_sort_down');
                    $('#nfvd_sort_time').removeClass('nfvd_c_sort_up').addClass('nfvd_c_sort_down');
                    if($('#nfvd_sort_status').attr('class')==='nfvd_c_sort_down'){
                        $scope.order='+state';
                        $('#nfvd_sort_status').removeClass('nfvd_c_sort_down').addClass('nfvd_c_sort_up');
                    }else{
                        $scope.order='-state';
                        $('#nfvd_sort_status').removeClass('nfvd_c_sort_up').addClass('nfvd_c_sort_down');
                    }
                };

                $scope.sortTimeClick=function(){
                    $('#nfvd_sort_status').removeClass('nfvd_c_sort_up').addClass('nfvd_c_sort_down');
                    $('#nfvd_sort_name').removeClass('nfvd_c_sort_up').addClass('nfvd_c_sort_down');
                    if($('#nfvd_sort_time').attr('class')==='nfvd_c_sort_down'){
                        $scope.order='+createTimestamp';
                        $('#nfvd_sort_time').removeClass('nfvd_c_sort_down').addClass('nfvd_c_sort_up');
                    }else{
                        $scope.order='-createTimestamp';
                        $('#nfvd_sort_time').removeClass('nfvd_c_sort_up').addClass('nfvd_c_sort_down');
                    }

                };


                VDC.initPalette($scope.widget.conf.vappPalette);
                //create rappid frames
                d.graph = new joint.dia.Graph({
                    type: 'vdcmgr'
                });
                d.paper = new joint.dia.Paper({
                    //el: $('#paper-holder-groups'),
                    width: 2000,
                    height: 600,
                    gridSize: 1,
                    model: d.graph,
                    perpendicularLinks: true,
                    interactive: false
                });
                d.paperScroller = new joint.ui.PaperScroller({
                    //autoreShapeToNetworkPaper: true,
                    autoResizePaper:true,
                    //padding: 50,
                    paper: d.paper
                });

                d.selection = new Backbone.Collection();
                d.selectionView = new joint.ui.nfvd.SelectionView({
                    paper: d.paper,
                    graph: d.graph,
                    model: d.selection
                });

                d.paper.on('blank:pointerdown', d.paperScroller.startPanning);
                $(window).resize(function() {
                    d.paperScroller.$el.css({
                        //width: 800,
                        height: getInnerHeight()-253
                    });
                }).resize();
                $('#paper-holder-groups').append(d.paperScroller.render().el);
                d.nav = new joint.ui.Navigator({
                    paperScroller: d.paperScroller,
                    width: 288,
                    height: 140,
                    padding: 0,
                    zoomOptions: { max: 2, min: 0.5 }
                });
                d.nav.$el.appendTo('#navigator');
                d.nav.render();
                //stencil
                d.stencil = new joint.ui.Stencil({
                    graph: d.graph,
                    paper: d.paper,
                    height:90
                });
                d.stencil.render().$el.appendTo('#stencil-holder-groups');
                d.stencil.getPaper().on('cell:pointerdown', function(cellView/*, evt, x, y*/) {
                    $scope.selArtifact={
                        source: 3,   //paper
                        artifact:cellView.model.attributes.artifact,
                        nameWithLimitedLength: _.trunc(cellView.model.attributes.artifact.name,19)
                    };
                    logger.debug('Selection in VDC:',$scope.selArtifact.artifact.type,$scope.selArtifact.artifact.id, $scope.selArtifact.artifact.state,$scope.selArtifact.artifact.status);
                    $scope.selArtifact.artifact.readonly = true;
                    $scope.$apply();
                });
                // events
                var initActionMenu = function(){
                    $scope.context.vAppGroudId = $scope.curVAPPGroupID;
                    $scope.context.vdcInstance = $scope.orgVDCInstance;
                    $scope.context.vdcId=$scope.curVdcID;
                    $scope.context.groupId=$scope.selVappGroups.id;
                    $scope.context.group=$scope.selVappGroups;
                    $scope.context.isStub = true;
                    $scope.context.refreshEventName='VDC_MANAGER_REFRESH';
                    $scope.context.flattenVDC=$scope.flattenVDC;
                    $scope.context.connections=$scope.connections;

                };

                $scope.initActionConext  = initActionMenu;
                
                $scope.vappGroupChange = function() {
                    logger.debug('VAPP group change');
                    initActionMenu();
                    refresh();
                };
                
 
                var clickEvent='VAPP_TEMPALTE_SELECTED';
                $scope.$on('webgui.dataExchange.'+clickEvent, function()  {
                    var id=dataExchangeService.getData(clickEvent);
                    // t is the selected template from the VDC Manager.
                    var t= {};
                    
                    // Each element of this array corresponds to the scope attribute name that host 
                    // a specific type of templates.
                    // vappCatalogs: for the VAPP templates
                    // components: for the VDC elements
                    // monitorCatalog: for the monitors.
                    // 
                    var componentType = ['vappCatalogs', 'components', 'monitorCatalog'];
                    _.each(componentType, function(item){
                        t= _.find($scope[item],function(template){
                            return COMPONENT.getComponentID(template) === id;
                        });
                        // If the template t is initialized, then the loop is stoped
                        if(!_.isEmpty(t)) {
                            return false;
                        }
                    });

                    $scope.selArtifact={
                        source: 4,   //select templates from the left-side bar
                        artifact: t
                    };
                    logger.debug('Selection in VDC:',$scope.selArtifact.artifact.type,$scope.selArtifact.artifact.id, $scope.selArtifact.artifact.state,$scope.selArtifact.artifact.status);
                    $scope.selArtifact.nameWithLimitedLength = _.trunc($scope.selArtifact.artifact.name,19);
                    $scope.selArtifact.artifact.readonly = true;
                    d.selectionView.cancelSelection();


                    //added by Ellen on 2015-11-11
                    //for differenct componenet choose the related actions
                    if (COMPONENT.isVirtualNetworkComponent($scope.selArtifact.artifact)){
                        $scope.context.menuIdentifier = 'VIRTUALNETWORK_TEMPLATE';
                    }else if(COMPONENT.isPhysicalNetworkComponent($scope.selArtifact.artifact)){
                        $scope.context.menuIdentifier = 'VIRTUALNETWORK_TEMPLATE';
                    }else if(COMPONENT.isExternalNetworkComponent($scope.selArtifact.artifact)){
                        $scope.context.menuIdentifier = 'VIRTUALNETWORK_TEMPLATE';
                    }else if(COMPONENT.isVAPPComponent($scope.selArtifact.artifact)){
                        $scope.context.menuIdentifier = 'VNF_TEMPLATE';
                    }else if(COMPONENT.isLoadBalanceComponent($scope.selArtifact.artifact)){
                        $scope.context.menuIdentifier = 'LOADBALANCE_TEMPLATE';
                    }else if(COMPONENT.isFirewallComponent($scope.selArtifact.artifact)){
                        $scope.context.menuIdentifier = 'FIREWALL_TEMPLATE';
                    }

                    //for action menu
                    // $scope.context.menuIdentifier = 'VNF_TEMPLATE';
                    $scope.context.createdComponent = $scope.selArtifact.artifact;
                    initActionMenu();
                    $scope.context.refesh = refresh;
                    $scope.context.refreshEventName=refreshEvent;

                    //active inspector page
                    $scope.inspectorActive();

                });
                var refreshEvent='VDC_MANAGER_REFRESH';
                $scope.$on('webgui.dataExchange.'+refreshEvent, function() {
                    refresh();
                    var eventID=dataExchangeService.getData(refreshEvent);
                    switch(eventID){
                        case CONSTANT.VAPP.VAPPCREATE:
                        case CONSTANT.VAPP.VAPPDELETE:
                            $scope.vappSelectorActive();
                            break;
                        default:
                            break;
                    }
                });
                var dirtyDataEvent='ATTRIBUTE_CHANGED';
                $scope.$on('webgui.dataExchange.'+dirtyDataEvent, function() {
                    var dirty=dataExchangeService.getData(dirtyDataEvent);
                    _.set($scope.orgVDCInstance,'isDirty',dirty);
                });
                
                

                $scope.getVAPPInstanceDisplayName=function(vapp){
                    return COMPONENT.getComponentName(vapp);
                };
                $scope.getTotalVMsOfVAPP=function(vapp){
                    return COMPONENT.getVMComponents(vapp).length;
                };
                d.graph.on('add',function(cell){
                    //do something when new cell added into the graph
                    if (! (cell instanceof joint.dia.Link)) {
                        var t=new joint.ui.Tooltip({
                            className:'nfvd_c_tooltip',
                            target: d.paper.findViewByModel(cell).el,
                            content: cell.getName()+' ('+COMPONENT.getPrettyFamily(cell.getVersion())+')',
                            direction: 'left'
                        });
                        //cell.set('tooltip', t);
                        //below is a faster way(not a good pratice), because it will not trigger the update event
                        cell.attributes.tooltip = t;
                        if(!t){
                            logger.error('Failed to create tooltip');
                        }
                    }
                });
                d.graph.on('remove',function(cell){
                    var t = cell.get('tooltip');
                    if (t) {
                        t.remove();
                    }
                });
                d.paper.on('cell:pointerdown', function(cellView/*, evt, x, y*/) {
                    if (cellView.model instanceof joint.dia.Link) {
                        return false;
                    }
                    else {
                        d.selectionView.cancelSelection();
                        d.selection.add(cellView.model);
                        d.selectionView.createSelectionBox(cellView);

                        $scope.selArtifact={
                            source: 1,
                            artifact: cellView.model.getArtifact(),
                            nameWithLimitedLength: _.trunc(cellView.model.getArtifact().name,19)
                        };
                        logger.debug('Selection in VDC:',$scope.selArtifact.artifact.type,$scope.selArtifact.artifact.id, $scope.selArtifact.artifact.state,$scope.selArtifact.artifact.status);
                        //cellView.model.setIcon({type:'all',status:0});
                        if(COMPONENT.isFirewallComponent($scope.selArtifact.artifact)){
                            if (COMPONENT.isComponentDeployed($scope.selArtifact.artifact)){
                                $scope.context.menuIdentifier = 'FIREWALL_INSTANCE_DEPLOYED';
                                $scope.selArtifact.artifact.readonly = true;
                            }else {
                                $scope.context.menuIdentifier = 'FIREWALL_INSTANCE_UNDEPLOYED';
                                $scope.selArtifact.artifact.readonly = false;
                            }

                        } else if (COMPONENT.isNetworkComponent($scope.selArtifact.artifact)) {
                            if (COMPONENT.isComponentDeployed($scope.selArtifact.artifact)){
                                // if($scope.isNetworkReadyToUndeploy(COMPONENT.getComponentID($scope.selArtifact.artifact))){
                                $scope.context.menuIdentifier = 'VIRTUALNETWORK_INSTANCE_DEPOLYED';
                                //  }
                                //  else{
                                //      $scope.context.menuIdentifier='';
                                //  }
                                $scope.selArtifact.artifact.readonly = true;
                            }else {
                                $scope.context.menuIdentifier = 'VIRTUALNETWORK_INSTANCE_UNDEPOLYED';
                                $scope.selArtifact.artifact.readonly = false;
                            }

                        } else if (COMPONENT.isVMComponent($scope.selArtifact.artifact)) {
                            if (COMPONENT.isComponentDeployed($scope.selArtifact.artifact)){
                                $scope.context.menuIdentifier = 'VM_INSTANCE_DEPLOYED';
                                $scope.selArtifact.artifact.readonly = true;

                            }else {
                                $scope.context.menuIdentifier = 'VM_INSTANCE_UNDEPLOYED';
                                $scope.selArtifact.artifact.readonly = false;
                            }

                        }  else if (COMPONENT.isFirewallComponent($scope.selArtifact.artifact)) {
                            $scope.context.menuIdentifier = 'VM_INSTANCE';
                            $scope.selArtifact.artifact.readonly = true;
                        }   else if (COMPONENT.isLoadBalanceComponent($scope.selArtifact.artifact)) {
                            if (COMPONENT.isComponentDeployed($scope.selArtifact.artifact)){
                                $scope.context.menuIdentifier = 'LOADBALANCE_INSTANCE_DEPLOYED';
                                $scope.selArtifact.artifact.readonly = true;
                            }else {
                                $scope.context.menuIdentifier = 'LOADBALANCE_INSTANCE_UNDEPLOYED';
                                $scope.selArtifact.artifact.readonly = false;
                            }
                        }
                        $scope.context.VappInstance = $scope.selArtifact;
                        $scope.context.vdcInstance =  $scope.orgVDCInstance;//$scope.vdcInstance;
                        $scope.context.isStub = true;
                        initActionMenu();

                        dataExchangeService.setData(unselect_event,null);
                        $scope.$apply();
                    }
                    $scope.inspectorActive();
                });
                d.paper.on('blank:pointerdown', function (/*evt, x, y*/) {
                    d.selectionView.cancelSelection();
                    if($scope.orgVDCInstance){
                        $scope.selArtifact={
                            source:1,
                            artifact:$scope.orgVDCInstance,
                            nameWithLimitedLength: $scope.orgVDCInstance?_.trunc($scope.orgVDCInstance.name,19):''
                        };
                        logger.debug("Selection in VDC:",$scope.selArtifact.artifact.type,$scope.selArtifact.artifact.id, $scope.selArtifact.artifact.state,$scope.selArtifact.artifact.status);
                        $scope.selArtifact.artifact.readonly = true;
                        dataExchangeService.setData(unselect_event,null);

                        $scope.context.menuIdentifier = 'VDC_INSTANCE';
                        $scope.context.VappInstance = $scope.selArtifact;
                        $scope.context.vdcInstance = $scope.orgVDCInstance; //$scope.vdcInstance;

                        $scope.context.isStub = true;

                        $scope.$apply();
                    }

                });

                // $scope functions
                function shiftColor(colorObj){
                    return colorObj.color;
                }

                $scope.menuOptions = function(item){
                    logger.log('menu configuration', item);
                    if (item.paper.$el.selector === '.elements'){
                        return [];
                    }
                    return [
                        ['Add Monitor', function(/*$itemScope*/){
                            item.model.setIcon({type:'monitor',status:1});
                        }],
                        ['Remove Monitor', function(){
                            item.model.setIcon({type:'monitor',status:0});
                        }]];
                };
                $scope.spinner = function(flag) {
                    $scope.widget.busy = flag;
                    $rootScope.$broadcast(flag ? 'webgui.nfvd.widgetRefreshStarted' : 'webgui.nfvd.widgetRefreshComplete', $scope.widget);
                };
                $scope.$on('webgui.widgetRefresh', function() {
                    //logger.debug($scope.widget.uniqueId, 'event webgui.widgetRefresh');
                    refresh();
                });

                $scope.isNetworkReadyToUndeploy=function(networkID){
                    var ret=true;
                    _.forEach($scope.connections,function(vapp){
                        if(_.find(vapp.connections,{networkID:networkID})){
                            ret=false;
                        }
                    });

                    return ret;
                };
                function refreshScopeBasicData(response){
        
                    $scope.selArtifact={
                            source:-1,
                            artifact:{}
                    };

                    var vdc=response.data.vdcInstance;
                    COMPONENT.enrichComponent(vdc);
                    $scope.orgVDCInstance=vdc;
                    $scope.vdcInstance=COMPONENT.reformatVDCInstance(vdc);

                    $scope.flattenVDC=COMPONENT.getComponentArtifactFlattenList(response.data.vdcInstance);
                    $scope.vapps=_.sortBy( COMPONENT.getVAPPsFromVDCInstance(response.data.vdcInstance),'name');
                    $scope.vappCatalogs=_.sortBy(response.data.vappTemplates,'name');
                    $scope.connections=COMPONENT.getVappConnections(response.data.vdcInstance,$scope.flattenVDC);

                    var fl=$scope.vdcInstance.lbs.concat($scope.vdcInstance.fws);
                    _.forEach(fl,function(lb){
                        lb.connections=[];
                        var c= _.find($scope.connections, {vappID:COMPONENT.getComponentID(lb)});
                        if(c&& c.connections&&c.connections.length>0){
                            _.forEach(c.connections,function(con){
                                lb.connections.push({
                                    networkId:con.networkID,
                                    type:con.type,
                                    state:con.state
                                });
                            });
                            //lb.connections= _.uniq(lb.connections);
                        }
                    });
                    $scope.vdcInstance.networks= _.sortBy($scope.vdcInstance.networks,'name');
                }
                function initVAPPInstance(vapp,vappStatus){
                    if(vappStatus){
                        var state=_.find(vappStatus,{id:COMPONENT.getComponentID(vapp)});
                        if(state){
                            vapp.show=state.show;
                            if(COMPONENT.isVappDeployed(vapp)){
                                vapp.color=state.color!=='lightgrey'?state.color:shiftColor(VDC.getVAppColor());
                            }else{
                                vapp.color = 'lightgrey';
                            }
                        }else{
                            vapp.show = false;
                            if(COMPONENT.isVappDeployed(vapp)){
                                vapp.color=shiftColor(VDC.getVAppColor());//.color;
                            }else{
                                vapp.color = 'lightgrey';
                            }
                        }
                    }else{
                        vapp.show=false;
                        if(COMPONENT.isVappDeployed(vapp)){
                            vapp.color=shiftColor(VDC.getVAppColor());//.color;
                        }else{
                            vapp.color = 'lightgrey';
                        }
                    }
                }
                var getCatalog = function(groupId) {
                    var route = '/nfvd-ext/get/catalog';
                    var query = 'groupId='+ groupId +'&type=monitor';

                   var p = dataAccessService.getRouteDeferred(route, query, false).promise;
                   p.then(function(result)  {
                        $scope.monitorCatalog = result.data;
                    }, function(error) {
                        console.error('could not obtain catalog monitors: ', error);
                        $scope.select.monitorTemplate = null;
                   });
                };
                

                function vdcStatistics(vappStatus){
                    $scope.totalVAPP=$scope.vapps?$scope.vapps.length:0;
                    $scope.totalVM=0;
                    var vappTotalResource= $scope.vappTotalResource={
                        vCore:{value:0},
                        vMem:{value:0},
                        vDisk:{value:0}
                    };
                    $scope.deployedVAPP=0;
                    $scope.deployedVM=0;
                    var vappDeployedResource=$scope.vappDeployedResource={
                        vCore:{value:0},
                        vMem:{value:0},
                        vDisk:{value:0}
                    };
                    $scope.totalNetwork=$scope.vdcInstance.networks.length;
                    $scope.totalFW=$scope.vdcInstance.fws.length;
                    $scope.totalLB=$scope.vdcInstance.lbs.length;

                    _.forEach($scope.vapps,function(vapp) {
                        if (COMPONENT.isComponentDeployed(vapp)) {
                            $scope.deployedVAPP = $scope.deployedVAPP + 1;
                        }
                        var vms = COMPONENT.getVMComponents(vapp);
                        if (vms) {
                            $scope.totalVM = $scope.totalVM + vms.length;

                        }
                        _.forEach(vms, function (vm) {
                            if (COMPONENT.isComponentDeployed(vm)) {
                                $scope.totalVM = $scope.totalVM + 1;

                                var arts= _.filter($scope.flattenVDC.artifacts,function(art){
                                    return art.componentID===COMPONENT.getComponentID(vm);
                                });
                                var DVappResource = COMPONENT.getComponentResourceInfo(vapp, {
                                    artifact:arts,
                                    relationships:[]
                                });
                                if(DVappResource){
                                    vappDeployedResource.vCore.value = parseInt(vappDeployedResource.vCore.value) + parseInt(DVappResource.vCore.value);
                                    vappDeployedResource.vCore.unit = DVappResource.vCore.unit;
                                    vappDeployedResource.vMem.value = parseInt(vappDeployedResource.vMem.value) + parseInt(DVappResource.vMem.value);
                                    vappDeployedResource.vMem.unit = DVappResource.vMem.unit;
                                    vappDeployedResource.vDisk.value = parseInt(vappDeployedResource.vDisk.value) + parseInt(DVappResource.vDisk.value);
                                    vappDeployedResource.vDisk.unit = DVappResource.vDisk.unit;
                                }
                            }
                        });
                        var vappResource = COMPONENT.getComponentResourceInfo(vapp);
                        if (vappResource) {
                            vappTotalResource.vCore.value = parseInt(vappTotalResource.vCore.value) + parseInt(vappResource.vCore.value);
                            vappTotalResource.vCore.unit = vappResource.vCore.unit;
                            vappTotalResource.vMem.value = parseInt(vappTotalResource.vMem.value) + parseInt(vappResource.vMem.value);
                            vappTotalResource.vMem.unit = vappResource.vMem.unit;
                            vappTotalResource.vDisk.value = parseInt(vappTotalResource.vDisk.value) + parseInt(vappResource.vDisk.value);
                            vappTotalResource.vDisk.unit = vappResource.vDisk.unit;
                        }
                        initVAPPInstance(vapp,vappStatus);  //put here?
                    });
                }
                function fetchVDCData(vappCatalogID){
                    $scope.isShowAllVapp=false;
                    var req=$scope.curVAPPGroupID?'vappUser=true':'vappUser=false';
                    if(!vappCatalogID){  //init view - need query the vapp group id
                        $scope.spinner(true);

                        var route1='/vdcm/tenant/'+$scope.curVdcID;

                        var p1 = dataAccessService.getRouteDeferred(route1, req, false).promise;
                        p1.then(
                            function(response) {
                                
                                
                                refreshScopeBasicData(response);
                                $scope.components=response.data.vdcComponents;
                                $scope.vappGroups=response.data.vappGroups;
                                $scope.selVappGroups=$scope.vappGroups?$scope.vappGroups[0]||'':'';

                                vdcStatistics();       

                                VDC.setVDC($scope.vdcInstance);
                                //draw init vdc instance (without vms)
                                d.graph.clear();
                                console.time('make object');
                                var cells = VDC.getVDCInstanceCells(conf);
                                console.timeEnd('make object');
                                d.graph.addCells(cells);
                                $scope.spinner(false);

                                getCatalog(response.data.vappGroups[0]['@internal-id']); 
                            },
                            function(error) {
                                //alert();
                                messageNotifierService.error('Can not fetch data from server, please check the connection to the server or tune the timeout settings. Error Message:'+error.data.message);
                                logger.error('Cant get data', route1, error);
                                $scope.spinner(false);
                            });
                    }else{   // already has group id
                        $scope.spinner(true);
                        var vappStatus=[];
                        _.forEach( $scope.vapps,function(vapp){
                            vappStatus.push({
                                id:COMPONENT.getComponentID(vapp),
                                show:vapp.show,
                                color:vapp.color
                            });
                        });
                        var route2='/vdcm/tenant/'+$scope.curVdcID+'/vappGroup/'+vappCatalogID;
                        var p2 = dataAccessService.getRouteDeferred(route2, req, false).promise;
                        p2.then(
                            function(response) {
                                refreshScopeBasicData(response);

                                if($scope.curVAPPGroupID){
                                    $scope.vappGroups=response.data.vappGroups;
                                    $scope.selVappGroups=$scope.vappGroups[0]||'';
                                }else{
                                    $scope.components=response.data.vdcComponents;

                                }
                                vdcStatistics(vappStatus);
                                refreshGraph();
                                $scope.spinner(false);
                            },
                            function(error) {
                                //alert();
                                messageNotifierService.error('Can not fetch data from server, please check the connection to the server or tune the timeout settings. Error Message:'+error.data.message);
                                logger.error('Can not get data', route2, error);
                                $scope.spinner(false);
                            });
                    }

                }
                var initView=function(){
                    fetchVDCData($scope.curVAPPGroupID);
                    $scope.vappSelectorActive();
                };

                var refreshGraph=function(){
                    logger.warn('VDC Manager refreshGraph!!!!!!!!!!!',$scope.vdcInstance);
                    var t0=new Date().getTime();
                    $scope.vdcInstance.vms=[];
                    _.forEach($scope.vapps,function(vapp){
                        if (vapp.show){
                            var vappid=COMPONENT.getComponentID(vapp);
                            var vms=COMPONENT.getVMComponents(vapp);
                            _.forEach(vms,function(vm){
                                vm.connections=[];
                                var vmid=COMPONENT.getComponentID(vm);
                                var c= _.find($scope.connections,{'vappID':vappid});
                                var c2= _.filter(c.connections,{'vmID':vmid});
                                _.forEach(c2,function(cc){
                                    vm.connections.push({
                                        networkId:cc.networkID,
                                        type:cc.type,
                                        state:cc.state
                                    });
                                });
                                vm.color=vapp.color;

                            });
                            $scope.vdcInstance.vms= _.union($scope.vdcInstance.vms,vms);
                        }
                    });

                    var tn=new Date().getTime();
                    logger.debug('****************  calculate cost:',tn-t0);

                    VDC.setVDC($scope.vdcInstance);
                    d.graph.clear();
                    var cells=VDC.getVDCInstanceCells(conf);

                    var tx=new Date().getTime();
                    logger.debug('****************  get cells cost:',tx-tn);

                    d.graph.addCells(cells);

                    var tt=new Date().getTime();
                    logger.debug('****************  draw cost:',tt-tx);


                };


                // dialog to indicate update before refresh.
                var updateActionDialog = function(originalVdc,callback){
                    console.warn(' in updateActionDialog');
                    if (!originalVdc){
                        return;
                    }

                    var vnfActionController = function ($scope, $modalInstance,
                                                        nfvdDataAccessService,
                                                        messageNotifierService,
                                                        nfvdJobsService) {

                        var vm = $scope.vm = {};
                        vm.undeployType = 'VNF';
                        vm.component = originalVdc;
                        vm.tableData = [];

                          vm.checkboxClick = function() {
                            for (var i = 0; i < vm.tableData.length; i++){
                                var item = vm.tableData[i];
                                item.checked = !item.checked;
                                item.checkValue = (item.checkValue === 'checked') ? 'unchecked' : 'checked';
                            }
                        };

                        var createTableData = function(component) {
                            if (component) {
                                if (component['artifact-instances']) {
                                    for (var i = 0; i < component['artifact-instances'].length; i++){
                                        var art = component['artifact-instances'][i];
                                        if (art.categories) {
                                            getRowFromCategory(art.categories, art, component);
                                        }
                                    }
                                }

                                if (component.subinstances){
                                    for (var j = 0; j < component.subinstances.length; j++) {
                                        var subinstance = component.subinstances[j];
                                        if (subinstance){
                                            createTableData(subinstance);
                                        }
                                    }
                                }
                            }
                        };

                        var isOdd = true;
                        var getRowFromCategory = function (categories, artifact, component) {
                            if (categories) {
                                for (var i = 0; i < categories.length; i++) {
                                    var category = categories[i];
                                    if (category && category.attributes) {
                                        for (var j = 0; j < category.attributes.length; j++) {
                                            var attribute = category.attributes[j];
                                            if (attribute && attribute.oldValue && attribute.oldValue !== attribute.value) {
                                                //var componentName = artifact['artifact-definition'].family.replace('_', ' ');
                                                var row = {
                                                    componentId: component.id,
                                                    artifactId: artifact.id,
                                                    componentName: 'NFVD_SERVICE.FAMILY.' +COMPONENT.getComponentType(component).toUpperCase(),
                                                    componentType: COMPONENT.getComponentType(component),
                                                    label: 'VAPP_DESIGNER.' +attribute.label.toUpperCase(),
                                                    category: 'VAPP_DESIGNER.' +category.label.toUpperCase(),
                                                    newValue: attribute.value,
                                                    oldValue: attribute.oldValue,
                                                    checked: true,
                                                    mIsOdd: !isOdd,
                                                    org_label:attribute.label,
                                                    org_category:category.label

                                                };
                                                vm.tableData.push(row);
                                            }
                                        }
                                    }
                                }
                            }
                        };
                        createTableData(vm.component);


                        $scope.ok = function () {
                            var attributes=[];
                            for (var i = 0; i < vm.tableData.length; i++) {
                                var item = vm.tableData[i];
                                var attr = {};
                                if (item.checked) {
                                    attr.instanceId = item.componentId;
                                    attr.artifactId = item.artifactId;
                                    attr.categoryName =item.org_category;// item.category;
                                    attr.attributeName =item.org_label;// item.label;
                                    attr.componentType = item.componentType;
                                    attr.value = item.newValue;
                                    attributes.push(attr);
                                }
                            }

                            var body={};
                            body.vdcId= $scope.context.vdcId;
                            body.vappGroupId= $scope.context.groupId;
                            body.VNFType = COMPONENT.getComponentType($scope.context.VappInstance.artifact);
                            body.attributes = attributes;

                            var p = nfvdDataAccessService.postRouteDeferred('/nfvd-ext/update/vnf', null, body).promise;
                            p.then(function (res) {
                                    if (res.status === 200) {
                                        //messageNotifierService.success('scale up vnf instance successfully: ' + vm.name);
                                        messageNotifierService.success('SENTENCES.SUCC_TO_UPDATE_VNF', {
                                            name: vm.name,
                                            message: res.data
                                        });
                                    } else if (res.status === 503) {
                                        messageNotifierService.success('SENTENCES.SUCC_TO_UPDATE_VNF', {
                                            name: vm.name,
                                            id: res.data.id
                                        });
                                        nfvdJobsService.addJob(res.data.id, vm.name);

                                    } else {
                                        messageNotifierService.error('SENTENCES.FAIL_TO_UPDATE_VNF', {
                                            name: vm.name,
                                            message: ''
                                        });
                                    }
                                    dataExchangeService.setData('ATTRIBUTE_CHANGED', false);
                                    $modalInstance.close('OK');
                                    callback();
                                }, function (error) {
                                    //messageNotifierService.error('Failed to scale up vnf instance: ' + vm.name);
                                    messageNotifierService.error('SENTENCES.FAIL_TO_UPDATE_VNF', {
                                        name: vm.name,
                                        message: JSON.stringify(error.data.message)
                                    });
                                    dataExchangeService.setData('ATTRIBUTE_CHANGED', false);
                                    $modalInstance.close('OK');
                                    callback();
                                }
                            );
                        };

                        $scope.cancel = function () {
                           // $modalInstance.dismiss('dismiss');
                            dataExchangeService.setData('ATTRIBUTE_CHANGED', false);
                            $modalInstance.close('OK');
                            callback();
                        };
                    };


                    var normal_model= {
                        scope:$scope,
                        templateUrl: '/addons/nfvd/widgets/nfvd-vdc-manager/nfvd_vdc_refresh_modal.html',
                        controller:  ['$scope','$modalInstance',
                            'nfvdDataAccessService','messageNotifierService',
                             'nfvdJobsService', vnfActionController],
                        resolve: {
                            nfvdDataAccessService: function () {
                                return dataAccessService;
                            },
                            messageNotifierService:function(){
                                return messageNotifierService;
                            },
                            dataExchangeService:function(){
                                return dataExchangeService;
                            },
                            nfvdJobsService:function(){
                                return nfvdJobsService;
                            }
                        },
                        //backdrop: isFocus,
                        backdrop:'static',
                        size: 'lg'
                    };

                    var modalInstance = $modal.open(
                        // chooseModal()
                        normal_model
                    );

                    modalInstance.result.then(function (selectedItem) {
                        logger.info('Modal close at: ' + selectedItem + ' ' + new Date());
                    }, function (dismissMsg) {
                        logger.info('Modal dismissed at: ' + dismissMsg + ' ' + new Date());
                    });
                };

                var refresh=$scope.refresh=function(){
                    logger.warn('VDC Manager Refreshing!!!!!!!!!!!');
                    //console.time('detect dirty');
                    if(COMPONENT.isComponentDirty($scope.orgVDCInstance)){
                        //call vdc update
                        updateActionDialog($scope.orgVDCInstance,function(){
                            fetchVDCData(COMPONENT.getComponentID($scope.selVappGroups));

                        });
                    }else{
                        fetchVDCData(COMPONENT.getComponentID($scope.selVappGroups));

                    }
                    //console.timeEnd('detect dirty');



                };
                $scope.vappSelectorActive=function(){
                    $translate(['VDC_MANAGER.VAPP_SELECTOR']).then(function (result) {
                        $('.nfvd_c_right-tab-y .nfvd_c_tab-rotate').each(function(i) {
                            var context=C.getHTMLContext($(this).get(0).innerHTML);
                            if(context==='VDC_MANAGER.VAPP_SELECTOR'||context===result['VDC_MANAGER.VAPP_SELECTOR']) {
                                $(this).addClass('selected');
                                var o=$('.nfvd_c_left-display-con-border');
                                var odiv = o.eq(i).get(0);
                                if($(odiv).css('display') === '' || $(odiv).css('display') === 'none'){
                                    o.slideUp(300).eq(i).slideDown(300);
                                }
                            }else{
                                $(this).removeClass('selected');
                            }
                        });
                    });


                };
                $scope.inspectorActive=function(){
                    $translate(['VDC_MANAGER.INSPECTOR']).then(function (result) {
                        $('.nfvd_c_right-tab-y .nfvd_c_tab-rotate').each(function(i) {
                            var context=C.getHTMLContext($(this).get(0).innerHTML);
                            if(context==='VDC_MANAGER.INSPECTOR'||context===result['VDC_MANAGER.INSPECTOR']) {
                                $(this).addClass('selected');
                                var o=$('.nfvd_c_left-display-con-border');
                                var odiv = o.eq(i).get(0);
                                if($(odiv).css('display') === '' || $(odiv).css('display') === 'none'){
                                    o.slideUp(300).eq(i).slideDown(300);
                                }
                            }else{
                                $(this).removeClass('selected');
                            }
                        });
                    });
                };
 
                $scope.showActionButton=function(){
                    var type=COMPONENT.getComponentType($scope.selArtifact.artifact);
                    if(!$scope.curVAPPGroupID){
                        return true;
                    }else{
                        return (type==='vnf'||type==='virtual_machine'||type==='vm'||type==='vapp');
                    }
                };
                $scope.showPanel=0;
                $scope.switchInfoPanel=function(){
                    $scope.showPanel=($scope.showPanel+1)%3;
                };

                $scope.vappsActive=function(){  //active vapp template list

                    $translate(['VDC_MANAGER.VAPPS']).then(function (result) {
                        $('.nfvd_c_left-tab-y .nfvd_c_tab-rotate').each(function(i) {
                            var context=C.getHTMLContext($(this).get(0).innerHTML);
                            if(context==='VDC_MANAGER.VAPPS'||context===result['VDC_MANAGER.VAPPS']) {
                                $(this).addClass('selected');
                                var o=$('.nfvd_c_right-display-con-border');
                                var odiv = o.eq(i).get(0);
                                if($(odiv).css('display') === '' || $(odiv).css('display') === 'none'){
                                    o.slideUp(300).eq(i).slideDown(300);
                                }
                            }else{
                                $(this).removeClass('selected');
                            }
                        });
                    });
                };

                $scope.disableLeftTabHeader=function(header){
                    $('.nfvd_c_left-tab-y .nfvd_c_tab-rotate').each(function(/*i*/) {
                        var hh='<translate class="ng-scope">'+header+'</translate>';
                        if($(this).get(0).innerHTML===hh) {
                            $('.nfvd_c_left-tab-y .nfvd_c_tab-rotate').addClass('nfvd_c_disabledHeader');
                        }
                    });
                };

                $scope.showAllVappInfo=function(){  //TODO: performance is not good
                    _.forEach($scope.vapps,function(vapp){
                        vapp.show=$scope.isShowAllVapp;
                        $scope.showVappVMs(vapp,true);
                    });
                    //refresh();
                    refreshGraph();
                };
                $scope.showVappVMs=function(vapp,notRefesh){
                    logger.warn('show/hide vms of vapp:',vapp);
                    if(!vapp.show){
                        $scope.isShowAllVapp=false;
                    }
                    if(!notRefesh){
                        $scope.spinner(true);
                        refreshGraph();
                        $scope.spinner(false);
                    }
                };
                $scope.showVappInfo=function(vapp){
                    logger.warn('show details information of vapp:',vapp.name);
                    d.selectionView.cancelSelection();

                    $scope.selArtifact={
                        source: 2, //vapp instance
                        artifact:vapp,
                        nameWithLimitedLength: _.trunc(vapp.name,19)
                    };
                    logger.debug('Selection in VDC:',$scope.selArtifact.artifact.type,$scope.selArtifact.artifact.id, $scope.selArtifact.artifact.state,$scope.selArtifact.artifact.status);
                    dataExchangeService.setData(unselect_event,null);

                    if(COMPONENT.isVappDeployed(vapp)){ //this function return true when vapp is not deploy
                        $scope.context.menuIdentifier = 'VNF_INSTANCE_DEPLOYED';
                        $scope.selArtifact.artifact.readonly = true;
                    }
                    else{
                        $scope.context.menuIdentifier ='VNF_INSTANCE_UNDEPLOYED';
                        $scope.selArtifact.artifact.readonly = false;
                    }

                    //$scope.context.menuIdentifier = 'VNF_INSTANCE';
                    $scope.context.VappInstance = $scope.selArtifact;
                    $scope.context.vdcInstance = $scope.orgVDCInstance;
                    initActionMenu();
                    $scope.context.isStub = true;
                    $scope.inspectorActive();
                };
                $scope.selArtifact={
                    source:-1,
                    artifact:{}
                };
                $scope.isVappIll=function(vapp){
                    if(COMPONENT.isVappDeployed(vapp)){ //TODO : state or status?
                        return vapp.state!=='ACTIVE';
                    }
                    return false;
                };

                //initialize
                var conf=$scope.widget.conf;  //TODO: get from configuration file
                initView();
                if($scope.curVAPPGroupID) {
                    $scope.disableLeftTabHeader('VDC_MANAGER.VDC_ELEMENTS');
                }
                $scope.vappsActive();
                function isLeftBarDisabled(i){
                    var ret=false;
                    $('.nfvd_c_left-tab-y .nfvd_c_tab-rotate').each(function(j) {
                        if(i===j){
                            if($(this) .hasClass('nfvd_c_disabledHeader')){
                                ret=true;
                            }
                        }
                    });
                    return ret;
                }
                // must run after 'disableLeftTabHeader'
                $('.nfvd_c_left-tab-y .nfvd_c_tab-rotate').each(function(i) {
                    if(isLeftBarDisabled(i)===false){
                        $(this).click(function(){
                            var o=$('.nfvd_c_right-display-con-border');
                            var odiv = o.eq(i).get(0);
                            if($(odiv).css('display') === '' || $(odiv).css('display') === 'none'){
                                o.slideUp(300).eq(i).slideDown(300);
                                $('.nfvd_c_left-tab-y .nfvd_c_tab-rotate').removeClass('selected').eq(i).addClass('selected');
                            }
                        });
                    }
                });
            }
        ]);

        return vdcmngrWidgetControllers;
    });
