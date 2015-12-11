create constraint on (c:TEMPLATE) ASSERT c.type is unique
create (:TEMPLATE:GRAN {type:"GRAN",desc:""})
create (:TEMPLATE:BSC {type:"BSC",desc:""})
create (:TEMPLATE:BTS {type:"BTS",desc:""})
match (gran:TEMPLATE {type:"GRAN"}) with gran match (bsc:TEMPLATE {type:"BSC"}) with bsc match (bts:TEMPLATE {type:"GTS"}) with bts
create (gran)-[:CONTAINS]->(bsc), (bsc)-[:CONTAINS]-(bts)