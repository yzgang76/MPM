match a-[r]->b delete a,r,b;
match e delete e;
merge (:TEMPLATE:GRAN {type:"GRAN",desc:""});
merge (:TEMPLATE:BSC {type:"BSC",desc:""});
merge (:TEMPLATE:BTS {type:"BTS",desc:""});
merge (:TEMPLATE:Windows_Host {type:"Windows_Host",desc:"windows7"});
match (gran:TEMPLATE {type:"GRAN"}) with gran match (bsc:TEMPLATE {type:"BSC"}) merge (gran)-[:CONTAINS]->(bsc);
match (bsc:TEMPLATE {type:"BSC"}) with bsc match (bts:TEMPLATE {type:"BTS"}) merge (bsc)-[:CONTAINS]->(bts);

merge (:GRANULARITY {id:3,type:"5mins",num:300});
merge (:GRANULARITY {id:0,type:"15mins",num:900});
merge (:GRANULARITY {id:1,type:"hourly",num:3600});
merge (:GRANULARITY {id:2,type:"daily",num:86400});

merge (:KPI_DEF {id:0,name:"number of service request",type:0,formula:"nbr_call_request"});
match (k:KPI_DEF {id:0}) with k match (bts:TEMPLATE {type:"BTS"}) merge (bts)-[:HAS_KPI]->(k);
match (k:KPI_DEF {id:0}) with k match (g:GRANULARITY {id:0}) merge (g)-[:HAS_KPI]->(k);

merge (:KPI_DEF {id:1,name:"number of success service request",type:0,formula:"nbr_call_response"});
match (k:KPI_DEF {id:1}) with k match (bts:TEMPLATE {type:"BTS"}) merge (bts)-[:HAS_KPI]->(k);
match (k:KPI_DEF {id:1}) with k match (g:GRANULARITY {id:0}) merge (g)-[:HAS_KPI]->(k);

merge (:KPI_DEF {id:2,name:"CSSR",type:1,formula:"K1/K0"});
match (k:KPI_DEF {id:2}) with k match (bts:TEMPLATE {type:"BTS"}) merge (bts)-[:HAS_KPI]->(k);
match (k:KPI_DEF {id:2}) with k match (g:GRANULARITY {id:0}) merge (g)-[:HAS_KPI]->(k);


merge (:KPI_DEF {id:3,name:"number of service request",type:2,formula:"sum(K0)"});
match (k:KPI_DEF {id:3}) with k match (bts:TEMPLATE {type:"BTS"}) merge (bts)-[:HAS_KPI]->(k);
match (k:KPI_DEF {id:3}) with k match (g:GRANULARITY {id:1}) merge (g)-[:HAS_KPI]->(k);


merge (:KPI_DEF {id:4,name:"number of success service request",type:2,formula:"sum(K1)"});
match (k:KPI_DEF {id:4}) with k match (bts:TEMPLATE {type:"BTS"}) merge (bts)-[:HAS_KPI]->(k);
match (k:KPI_DEF {id:4}) with k match (g:GRANULARITY {id:1}) merge (g)-[:HAS_KPI]->(k);


merge (:KPI_DEF {id:5,name:"CSSR",type:1,formula:"K4/K3"});
match (k:KPI_DEF {id:5}) with k match (bts:TEMPLATE {type:"BTS"}) merge (bts)-[:HAS_KPI]->(k);
match (k:KPI_DEF {id:5}) with k match (g:GRANULARITY {id:1}) merge (g)-[:HAS_KPI]->(k);


merge (:KPI_DEF {id:6,name:"number of service request",type:3,formula:"sum(K0)"});
match (k:KPI_DEF {id:6}) with k match (bsc:TEMPLATE {type:"BSC"}) merge (bsc)-[:HAS_KPI]->(k);
match (k:KPI_DEF {id:6}) with k match (g:GRANULARITY {id:0}) merge (g)-[:HAS_KPI]->(k);


merge (:KPI_DEF {id:7,name:"number of success service request",type:3,formula:"sum(K1)"});
match (k:KPI_DEF {id:7}) with k match (bsc:TEMPLATE {type:"BSC"}) merge (bsc)-[:HAS_KPI]->(k);
match (k:KPI_DEF {id:7}) with k match (g:GRANULARITY {id:0}) merge (g)-[:HAS_KPI]->(k);


merge (:KPI_DEF {id:8,name:"CSSR",type:1,formula:"K7/K6"});
match (k:KPI_DEF {id:8}) with k match (bsc:TEMPLATE {type:"BSC"}) merge (bsc)-[:HAS_KPI]->(k);
match (k:KPI_DEF {id:8}) with k match (g:GRANULARITY {id:0}) merge (g)-[:HAS_KPI]->(k);


merge (:KPI_DEF {id:9,name:"number of service request",type:2,formula:"sum(K6)"});
match (k:KPI_DEF {id:9}) with k match (bsc:TEMPLATE {type:"BSC"}) merge (bsc)-[:HAS_KPI]->(k);
match (k:KPI_DEF {id:9}) with k match (g:GRANULARITY {id:1}) merge (g)-[:HAS_KPI]->(k);


merge (:KPI_DEF {id:10,name:"number of success service request",type:2,formula:"sum(K7)"});
match (k:KPI_DEF {id:10}) with k match (bsc:TEMPLATE {type:"BSC"}) merge (bsc)-[:HAS_KPI]->(k);
match (k:KPI_DEF {id:10}) with k match (g:GRANULARITY {id:1}) merge (g)-[:HAS_KPI]->(k);


merge (:KPI_DEF {id:11,name:"CSSR",type:1,formula:"K10/K9"});
match (k:KPI_DEF {id:11}) with k match (bsc:TEMPLATE {type:"BSC"}) merge (bsc)-[:HAS_KPI]->(k);
match (k:KPI_DEF {id:11}) with k match (g:GRANULARITY {id:1}) merge (g)-[:HAS_KPI]->(k);


merge (:KPI_DEF {id:12,name:"number of service request",type:3,formula:"sum(K6)"});
match (k:KPI_DEF {id:12}) with k match (gran:TEMPLATE {type:"GRAN"}) merge (gran)-[:HAS_KPI]->(k);
match (k:KPI_DEF {id:12}) with k match (g:GRANULARITY {id:0}) merge (g)-[:HAS_KPI]->(k);


merge (:KPI_DEF {id:13,name:"number of success service request",type:3,formula:"sum(K7)"});
match (k:KPI_DEF {id:13}) with k match (gran:TEMPLATE {type:"GRAN"}) merge (gran)-[:HAS_KPI]->(k);
match (k:KPI_DEF {id:13}) with k match (g:GRANULARITY {id:0}) merge (g)-[:HAS_KPI]->(k);


merge (:KPI_DEF {id:14,name:"CSSR",type:1,formula:"K13/K12"});
match (k:KPI_DEF {id:14}) with k match (gran:TEMPLATE {type:"GRAN"}) merge (gran)-[:HAS_KPI]->(k);
match (k:KPI_DEF {id:14}) with k match (g:GRANULARITY {id:0}) merge (g)-[:HAS_KPI]->(k);


merge (:KPI_DEF {id:15,name:"number of service request",type:2,formula:"sum(K12)"});
match (k:KPI_DEF {id:15}) with k match (gran:TEMPLATE {type:"GRAN"}) merge (gran)-[:HAS_KPI]->(k);
match (k:KPI_DEF {id:15}) with k match (g:GRANULARITY {id:1}) merge (g)-[:HAS_KPI]->(k);


merge (:KPI_DEF {id:16,name:"number of success service request",type:2,formula:"sum(K13)"});
match (k:KPI_DEF {id:16}) with k match (gran:TEMPLATE {type:"GRAN"}) merge (gran)-[:HAS_KPI]->(k);
match (k:KPI_DEF {id:16}) with k match (g:GRANULARITY {id:1}) merge (g)-[:HAS_KPI]->(k);


merge (:KPI_DEF {id:17,name:"CSSR",type:1,formula:"K16/K15"});
match (k:KPI_DEF {id:17}) with k match (gran:TEMPLATE {type:"GRAN"}) merge (gran)-[:HAS_KPI]->(k);
match (k:KPI_DEF {id:17}) with k match (g:GRANULARITY {id:1}) merge (g)-[:HAS_KPI]->(k);


merge (:KPI_DEF {id:100,name:"KPI1",type:0,formula:"KPI1"});
match (k:KPI_DEF {id:100}) with k match (bts:TEMPLATE {type:"BTS"}) merge (bts)-[:HAS_KPI]->(k);
match (k:KPI_DEF {id:100}) with k match (g:GRANULARITY {id:0}) merge (g)-[:HAS_KPI]->(k);

merge (:KPI_DEF {id:101,name:"KPI2",type:0,formula:"KPI2"});
match (k:KPI_DEF {id:101}) with k match (bts:TEMPLATE {type:"BTS"}) merge (bts)-[:HAS_KPI]->(k);
match (k:KPI_DEF {id:101}) with k match (g:GRANULARITY {id:0}) merge (g)-[:HAS_KPI]->(k);

merge (:KPI_DEF {id:102,name:"KPI3",type:0,formula:"KPI3"});
match (k:KPI_DEF {id:102}) with k match (bts:TEMPLATE {type:"BTS"}) merge (bts)-[:HAS_KPI]->(k);
match (k:KPI_DEF {id:102}) with k match (g:GRANULARITY {id:0}) merge (g)-[:HAS_KPI]->(k);

merge (:KPI_DEF {id:103,name:"KPI4",type:0,formula:"KPI4"});
match (k:KPI_DEF {id:103}) with k match (bts:TEMPLATE {type:"BTS"}) merge (bts)-[:HAS_KPI]->(k);
match (k:KPI_DEF {id:103}) with k match (g:GRANULARITY {id:0}) merge (g)-[:HAS_KPI]->(k);

merge (:KPI_DEF {id:104,name:"KPI5",type:0,formula:"KPI5"});
match (k:KPI_DEF {id:104}) with k match (bts:TEMPLATE {type:"BTS"}) merge (bts)-[:HAS_KPI]->(k);
match (k:KPI_DEF {id:104}) with k match (g:GRANULARITY {id:0}) merge (g)-[:HAS_KPI]->(k);

merge (:KPI_DEF {id:105,name:"KPI6",type:0,formula:"KPI6"});
match (k:KPI_DEF {id:105}) with k match (bts:TEMPLATE {type:"BTS"}) merge (bts)-[:HAS_KPI]->(k);
match (k:KPI_DEF {id:105}) with k match (g:GRANULARITY {id:0}) merge (g)-[:HAS_KPI]->(k);

merge (:KPI_DEF {id:106,name:"KPI7",type:0,formula:"KPI7"});
match (k:KPI_DEF {id:106}) with k match (bts:TEMPLATE {type:"BTS"}) merge (bts)-[:HAS_KPI]->(k);
match (k:KPI_DEF {id:106}) with k match (g:GRANULARITY {id:0}) merge (g)-[:HAS_KPI]->(k);

merge (:KPI_DEF {id:107,name:"KPI8",type:0,formula:"KPI8"});
match (k:KPI_DEF {id:107}) with k match (bts:TEMPLATE {type:"BTS"}) merge (bts)-[:HAS_KPI]->(k);
match (k:KPI_DEF {id:107}) with k match (g:GRANULARITY {id:0}) merge (g)-[:HAS_KPI]->(k);

merge (:KPI_DEF {id:108,name:"KPI9",type:0,formula:"KPI9"});
match (k:KPI_DEF {id:108}) with k match (bts:TEMPLATE {type:"BTS"}) merge (bts)-[:HAS_KPI]->(k);
match (k:KPI_DEF {id:108}) with k match (g:GRANULARITY {id:0}) merge (g)-[:HAS_KPI]->(k);

merge (:KPI_DEF {id:109,name:"KPI10",type:0,formula:"KPI10"});
match (k:KPI_DEF {id:109}) with k match (bts:TEMPLATE {type:"BTS"}) merge (bts)-[:HAS_KPI]->(k);
match (k:KPI_DEF {id:109}) with k match (g:GRANULARITY {id:0}) merge (g)-[:HAS_KPI]->(k);


create (a:ACTION{id:1,type:"log event"}),(:ACTION{id:2,type:"send SNMP Trap Message",conf:"..."}),(:ACTION{id:3,type:"execute script",script:"..."}), (:ACTION{id:4,type:"invoke API",api:"..."});
match (k:KPI_DEF{id:25}) , (a:ACTION{id:1}) with k,a create (e:THRESHOLD {id:1,condition: "v.value>60 and v.value<=80" ,level:"warning"})  , (k)-[:HAS_THRESHOLD]->(e),(e)-[:HAS_ACTION]->(a);
match (k:KPI_DEF{id:25}) , (a:ACTION{id:2}) with k,a create (e:THRESHOLD {id:2,condition: "v.value>80" ,level:"critical"})  , (k)-[:HAS_THRESHOLD]->(e),(e)-[:HAS_ACTION]->(a);
match (k:KPI_DEF{id:25}) , (a:ACTION{id:1}) with k,a create (e:THRESHOLD {id:3,condition: "v.value>0 and v.value<=60" ,level:"minor"})  , (k)-[:HAS_THRESHOLD]->(e),(e)-[:HAS_ACTION]->(a);
match (k:KPI_DEF{id:5}) , (a:ACTION{id:3}) with k,a create (e:THRESHOLD {id:4,condition: "v.value<0.9" ,level:"critical"})  , (k)-[:HAS_THRESHOLD]->(e),(e)-[:HAS_ACTION]->(a);
