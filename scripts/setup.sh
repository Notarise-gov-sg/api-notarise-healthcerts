# Start localstack
docker-compose up -d

# Wait for localstack to be ready
sleep 10

# Setup DynamoDB with seed data

# create resident-demographics-dev table
aws dynamodb --endpoint-url=http://localhost:8002 create-table \
    --table-name resident-demographics-dev \
    --attribute-definitions \
        AttributeName=uin,AttributeType=S \
    --key-schema \
        AttributeName=uin,KeyType=HASH \
    --provisioned-throughput \
        ReadCapacityUnits=10,WriteCapacityUnits=5

# insert batch seed data to table
aws dynamodb --endpoint-url=http://localhost:8002 batch-write-item \
    --request-items file://scripts/seeds/demographics-items.json \
    --return-consumed-capacity INDEXES \
    --return-item-collection-metrics SIZE
