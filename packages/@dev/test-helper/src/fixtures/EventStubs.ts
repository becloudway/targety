export const GenericRecordsObject = <T>(records: T[] | T) => ({
    Records: Array.isArray(records) ? records : [records],
});

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const s3Event = (override: any = {}, bucketOverride: any = {}, objectOverride: any = {}) => ({
    eventVersion: "2.1",
    eventSource: "aws:s3",
    awsRegion: "us-west-2",
    eventTime: "1970-01-01T00:00:00.000Z",
    eventName: "ObjectCreated:Put",
    userIdentity: {
        principalId: "AIDAJDPLRKLG7UEXAMPLE",
    },
    requestParameters: {
        sourceIPAddress: "127.0.0.1",
    },
    responseElements: {
        "x-amz-request-id": "C3D13FE58DE4C810",
        "x-amz-id-2": "FMyUVURIY8/IgAtTv8xRjskZQpcIZ9KG4V5Wp6S7S/JRWeUWerMUE5JgHvANOjpD",
    },
    s3: {
        s3SchemaVersion: "1.0",
        configurationId: "testConfigRule",
        bucket: {
            name: "mybucket",
            ownerIdentity: {
                principalId: "A3NL1KOZZKExample",
            },
            arn: "arn:aws:s3:::mybucket",
            ...bucketOverride,
        },
        object: {
            key: "HappyFace.jpg",
            size: 1024,
            eTag: "d41d8cd98f00b204e9800998ecf8427e",
            versionId: "096fKKXTRTtl3on89fVO.nfljtsv6qko",
            sequencer: "0055AED6DCD90281E5",
            ...objectOverride,
        },
    },
    ...override,
});

export const sqsEvent = (override = {}) => ({
    messageId: "059f36b4-87a3-44ab-83d2-661975830a7d",
    receiptHandle: "AQEBwJnKyrHigUMZj6rYigCgxlaS3SLy0a...",
    body: "Test message.",
    attributes: {
        ApproximateReceiveCount: "1",
        SentTimestamp: "1545082649183",
        SenderId: "AIDAIENQZJOLO23YVJ4VO",
        ApproximateFirstReceiveTimestamp: "1545082649185",
    },
    messageAttributes: {},
    md5OfBody: "e4e68fb7bd0e697a0ae8f1bb342846b3",
    eventSource: "aws:sqs",
    eventSourceARN: "arn:aws:sqs:us-east-2:123456789012:my-queue",
    awsRegion: "us-east-2",
    ...override,
});

export const snsEvent = (override = {}) => ({
    EventVersion: "1.0",
    EventSubscriptionArn: "arn:aws:sns:us-east-2:123456789012:sns-lambda:21be56ed-a058-49f5-8c98-aedd2564c486",
    EventSource: "aws:sns",
    Sns: {
        SignatureVersion: "1",
        Timestamp: "2019-01-02T12:45:07.000Z",
        Signature: "tcc6faL2yUC6dgZdmrwh1Y4cGa/ebXEkAi6RibDsvpi+tE/1+82j...65r==",
        SigningCertUrl:
            "https://sns.us-east-2.amazonaws.com/SimpleNotificationService-ac565b8b1a6c5d002d285f9598aa1d9b.pem",
        MessageId: "95df01b4-ee98-5cb9-9903-4c221d41eb5e",
        Message: "Hello from SNS!",
        MessageAttributes: {
            Test: {
                Type: "String",
                Value: "TestString",
            },
            TestBinary: {
                Type: "Binary",
                Value: "TestBinary",
            },
        },
        Type: "Notification",
        UnsubscribeUrl:
            "https://sns.us-east-2.amazonaws.com/?Action=Unsubscribe&amp;SubscriptionArn=arn:aws:sns:us-east-2:123456789012:test-lambda:21be56ed-a058-49f5-8c98-aedd2564c486",
        TopicArn: "arn:aws:sns:us-east-2:123456789012:sns-lambda",
        Subject: "TestInvoke",
    },
    ...override,
});

export const RequestAuthorizer = (override = {}) => ({
    type: "REQUEST",
    methodArn: "arn:aws:execute-api:us-east-1:123456789012:abcdef123/test/GET/request",
    resource: "/request",
    path: "/request",
    httpMethod: "GET",
    headers: {
        "X-AMZ-Date": "20170718T062915Z",
        Accept: "*/*",
        HeaderAuth1: "headerValue1",
        "CloudFront-Viewer-Country": "US",
        "CloudFront-Forwarded-Proto": "https",
        "CloudFront-Is-Tablet-Viewer": "false",
        "CloudFront-Is-Mobile-Viewer": "false",
        "User-Agent": "...",
    },
    queryStringParameters: {
        QueryString1: "queryValue1",
    },
    pathParameters: {},
    stageVariables: {
        StageVar1: "stageValue1",
    },
    requestContext: {
        path: "/request",
        accountId: "123456789012",
        resourceId: "05c7jb",
        stage: "test",
        requestId: "...",
        identity: {
            apiKey: "...",
            sourceIp: "...",
            clientCert: {
                clientCertPem: "CERT_CONTENT",
                subjectDN: "www.example.com",
                issuerDN: "Example issuer",
                serialNumber: "a1:a1:a1:a1:a1:a1:a1:a1:a1:a1:a1:a1:a1:a1:a1:a1",
                validity: {
                    notBefore: "May 28 12:30:02 2019 GMT",
                    notAfter: "Aug  5 09:36:04 2021 GMT",
                },
            },
        },
        resourcePath: "/request",
        httpMethod: "GET",
        apiId: "abcdef123",
    },
    ...override,
});
