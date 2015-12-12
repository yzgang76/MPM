create constraint on (c:TEMPLATE) ASSERT c.type is unique;
create constraint on (c:KPI_DEF) ASSERT c.id is unique;
create constraint on (c:GRANULARITY) ASSERT c.id is unique;
create constraint on (c:INSTANCE) ASSERT c.id is unique;
create constraint on (c:KPI_VALUE) ASSERT c.key is unique;