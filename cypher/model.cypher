match a-[r]->b delete a,r,b;
match e delete e;
merge (:TEMPLATE:GRAN {type:"GRAN",desc:""});
merge (:TEMPLATE:BSC {type:"BSC",desc:""});
merge (:TEMPLATE:BTS {type:"BTS",desc:""});
match (gran:TEMPLATE {type:"GRAN"}) with gran match (bsc:TEMPLATE {type:"BSC"}) merge (gran)-[:CONTAINS]->(bsc);
match (bsc:TEMPLATE {type:"BSC"}) with bsc match (bts:TEMPLATE {type:"BTS"}) merge (bsc)-[:CONTAINS]->(bts);

merge (:GRANULARITY {id:0,type:"15mins",num:900});
merge (:GRANULARITY {id:1,type:"hourly",num:3600});
merge (:GRANULARITY {id:2,type:"daily",num:66400});

merge (:KPI_DEF {id:0,name:"number of service request",type:0,formula:"nbr_call_request"});
match (k:KPI_DEF {id:0}) with k match (bts:TEMPLATE {type:"BTS"}) merge (bts)-[:HAS_KPI]->(k);
match (k:KPI_DEF {id:0}) with k match (g:GRANULARITY {id:0}) merge (g)-[:HAS_KPI]->(k);

merge (:KPI_DEF {id:1,name:"number of success service request",type:0,formula:"nbr_call_response"});
match (k:KPI_DEF {id:1}) with k match (bts:TEMPLATE {type:"BTS"}) merge (bts)-[:HAS_KPI]->(k);
match (k:KPI_DEF {id:1}) with k match (g:GRANULARITY {id:0}) merge (g)-[:HAS_KPI]->(k);

merge (:KPI_DEF {id:2,name:"CSSR",type:1,formula:"K1/K0"});
match (k:KPI_DEF {id:2}) with k match (bts:TEMPLATE {type:"BTS"}) merge (bts)-[:HAS_KPI]->(k);
match (k:KPI_DEF {id:2}) with k match (g:GRANULARITY {id:0}) merge (g)-[:HAS_KPI]->(k);
match (k:KPI_DEF {id:2}) with k match (k1:KPI_DEF {id:1}) merge (k)-[:DEPEND_ON]->(k1);
match (k:KPI_DEF {id:2}) with k match (k1:KPI_DEF {id:0}) merge (k)-[:DEPEND_ON]->(k1);

merge (:KPI_DEF {id:3,name:"number of service request",type:2,formula:"sum(K0)"});
match (k:KPI_DEF {id:3}) with k match (bts:TEMPLATE {type:"BTS"}) merge (bts)-[:HAS_KPI]->(k);
match (k:KPI_DEF {id:3}) with k match (g:GRANULARITY {id:1}) merge (g)-[:HAS_KPI]->(k);
match (k:KPI_DEF {id:3}) with k match (k1:KPI_DEF {id:0}) merge (k)-[:DEPEND_ON]->(k1);

merge (:KPI_DEF {id:4,name:"number of success service request",type:2,formula:"sum(K1)"});
match (k:KPI_DEF {id:4}) with k match (bts:TEMPLATE {type:"BTS"}) merge (bts)-[:HAS_KPI]->(k);
match (k:KPI_DEF {id:4}) with k match (g:GRANULARITY {id:1}) merge (g)-[:HAS_KPI]->(k);
match (k:KPI_DEF {id:4}) with k match (k1:KPI_DEF {id:1}) merge (k)-[:DEPEND_ON]->(k1);

merge (:KPI_DEF {id:5,name:"CSSR",type:1,formula:"K4/K3"});
match (k:KPI_DEF {id:5}) with k match (bts:TEMPLATE {type:"BTS"}) merge (bts)-[:HAS_KPI]->(k);
match (k:KPI_DEF {id:5}) with k match (g:GRANULARITY {id:1}) merge (g)-[:HAS_KPI]->(k);
match (k:KPI_DEF {id:5}) with k match (k1:KPI_DEF {id:4}) merge (k)-[:DEPEND_ON]->(k1);
match (k:KPI_DEF {id:5}) with k match (k1:KPI_DEF {id:3}) merge (k)-[:DEPEND_ON]->(k1);

merge (:KPI_DEF {id:6,name:"number of service request",type:3,formula:"sum(K0)"});
match (k:KPI_DEF {id:6}) with k match (bsc:TEMPLATE {type:"BSC"}) merge (bsc)-[:HAS_KPI]->(k);
match (k:KPI_DEF {id:6}) with k match (g:GRANULARITY {id:0}) merge (g)-[:HAS_KPI]->(k);
match (k:KPI_DEF {id:6}) with k match (k1:KPI_DEF {id:0}) merge (k)-[:DEPEND_ON]->(k1);

merge (:KPI_DEF {id:7,name:"number of success service request",type:3,formula:"sum(K1)"});
match (k:KPI_DEF {id:7}) with k match (bsc:TEMPLATE {type:"BSC"}) merge (bsc)-[:HAS_KPI]->(k);
match (k:KPI_DEF {id:7}) with k match (g:GRANULARITY {id:0}) merge (g)-[:HAS_KPI]->(k);
match (k:KPI_DEF {id:7}) with k match (k1:KPI_DEF {id:1}) merge (k)-[:DEPEND_ON]->(k1);

merge (:KPI_DEF {id:8,name:"CSSR",type:1,formula:"K7/K6"});
match (k:KPI_DEF {id:8}) with k match (bsc:TEMPLATE {type:"BSC"}) merge (bsc)-[:HAS_KPI]->(k);
match (k:KPI_DEF {id:8}) with k match (g:GRANULARITY {id:0}) merge (g)-[:HAS_KPI]->(k);
match (k:KPI_DEF {id:8}) with k match (k1:KPI_DEF {id:7}) merge (k)-[:DEPEND_ON]->(k1);
match (k:KPI_DEF {id:8}) with k match (k1:KPI_DEF {id:6}) merge (k)-[:DEPEND_ON]->(k1);

merge (:KPI_DEF {id:9,name:"number of service request",type:3,formula:"sum(K6)"});
match (k:KPI_DEF {id:9}) with k match (bsc:TEMPLATE {type:"BSC"}) merge (bsc)-[:HAS_KPI]->(k);
match (k:KPI_DEF {id:9}) with k match (g:GRANULARITY {id:1}) merge (g)-[:HAS_KPI]->(k);
match (k:KPI_DEF {id:9}) with k match (k1:KPI_DEF {id:6}) merge (k)-[:DEPEND_ON]->(k1);

merge (:KPI_DEF {id:10,name:"number of success service request",type:3,formula:"sum(K7)"});
match (k:KPI_DEF {id:10}) with k match (bsc:TEMPLATE {type:"BSC"}) merge (bsc)-[:HAS_KPI]->(k);
match (k:KPI_DEF {id:10}) with k match (g:GRANULARITY {id:1}) merge (g)-[:HAS_KPI]->(k);
match (k:KPI_DEF {id:10}) with k match (k1:KPI_DEF {id:7}) merge (k)-[:DEPEND_ON]->(k1);

merge (:KPI_DEF {id:11,name:"CSSR",type:1,formula:"K10/K9"});
match (k:KPI_DEF {id:11}) with k match (bsc:TEMPLATE {type:"BSC"}) merge (bsc)-[:HAS_KPI]->(k);
match (k:KPI_DEF {id:11}) with k match (g:GRANULARITY {id:1}) merge (g)-[:HAS_KPI]->(k);
match (k:KPI_DEF {id:11}) with k match (k1:KPI_DEF {id:10}) merge (k)-[:DEPEND_ON]->(k1);
match (k:KPI_DEF {id:11}) with k match (k1:KPI_DEF {id:9}) merge (k)-[:DEPEND_ON]->(k1);

