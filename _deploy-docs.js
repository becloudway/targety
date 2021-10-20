const ftp = require("basic-ftp");

const { ftp_user, ftp_password, ftp_host } = process.env;

const uploadApiSpec = async (client) => {
    await client.ensureDir("./api");
    await client.clearWorkingDir();

    await client.uploadFromDir("./packages/targety/docs");
};

const uploadWrittenDocs = async (client) => {
    await client.ensureDir("./docs");
    await client.clearWorkingDir();

    await client.uploadFromDir("./docs/_build/html");
};

const uploadDocs = async () => {
    const client = new ftp.Client();
    client.ftp.verbose = true;
    try {
        await client.access({
            user: ftp_user,
            password: ftp_password,
            host: ftp_host,
        });

        await client.cd("./domains/mitchanical.io/public_html/prov/targety");

        await uploadApiSpec(client);
        await client.cdup();
        await uploadWrittenDocs(client);
    } catch (ex) {
        console.log(ex);
    }

    console.log("DONE");

    client.close();
};

uploadDocs();
