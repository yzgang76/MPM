match (v:KPI_VALUE)<-[r:HAS_KPI_VALUE]-(i:INSTANCE) where v.name='nbr_call_request' and i.id='BTS1' with i.id as ne, v match (v1:KPI_VALUE)<-[:HAS_KPI_VALUE]-(d:KPI_DEF) where v1.key=v.key return ne,d.name,sum(v.value) as value,collect(v.value) as c;