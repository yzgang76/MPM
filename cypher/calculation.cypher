match (v:KPI_VALUE)<-[r:HAS_KPI_VALUE]-(i:INSTANCE) where v.name='nbr_call_request' and i.id='BTS1' with i.id as ne, v match (v1:KPI_VALUE)<-[:HAS_KPI_VALUE]-(d:KPI_DEF) where v1.key=v.key return ne,d.name,sum(v.value) as value,collect(v.value) as c;


match (k:KPI_DEF{id:25}) , (a:ACTION{id:1}) with k,a create (e:THRESHOLD {id:1,condition: "v.value>60 and v.value<=80" ,level:"warning"})  , (k)-[:HAS_THRESHOLD]->(e),(e)-[:HAS_ACTION]->(a) return k,e,a;
match (k:KPI_DEF{id:25}) , (a:ACTION{id:2}) with k,a create (e:THRESHOLD {id:2,condition: "v.value>80" ,level:"critical"})  , (k)-[:HAS_THRESHOLD]->(e),(e)-[:HAS_ACTION]->(a) return k,e,a;
match (k:KPI_DEF{id:25}) , (a:ACTION{id:1}) with k,a create (e:THRESHOLD {id:3,condition: "v.value>0 and v.value<=60" ,level:"minor"})  , (k)-[:HAS_THRESHOLD]->(e),(e)-[:HAS_ACTION]->(a) return k,e,a;