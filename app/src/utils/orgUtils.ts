import { Client } from "fabric-common";
import { Wallet, Wallets } from "fabric-network";
import { existsSync as fsExistsSync, readFileSync as fsReadFileSync } from "fs";
import { resolve as pathResolve } from "path";
import { config as dotenvConfig } from "dotenv";

dotenvConfig({ path: pathResolve(__dirname, 'environments', 'ledger.env')});

const buildCCPOrg = (n : number) : Client => {
	const organizationsPath = process.env["ORGANIZATIONS_PATH"] || pathResolve(__dirname, '..', '..', '..', 'my-chaincode', 'organizations');
	const ccpPath = pathResolve(organizationsPath, 'peerOrganizations', `org${n}.example.com`, `connection-org${n}.json`);

	const fileExists = fsExistsSync(ccpPath);
	if (!fileExists) {
		throw new Error(`no such file or directory: ${ccpPath}`);
	}
	const contents = fsReadFileSync(ccpPath, 'utf8');

	const ccp = JSON.parse(contents);
	console.log(`Loaded the network configuration located at ${ccpPath}`);

	return ccp;
};

const buildWallet = async (walletPath : string) : Promise<Wallet> => {
	let wallet : Wallet;
	if (walletPath) {
		wallet = await Wallets.newFileSystemWallet(walletPath);
		console.log(`Built a file system wallet at ${walletPath}`);
	} else {
		wallet = await Wallets.newInMemoryWallet();
		console.log('Built an in memory wallet');
	}

	return wallet;
};

const prettyJSONString = (inputString : string) : string => {
	if (inputString) {
		 return JSON.stringify(JSON.parse(inputString), null, 2);
	}
	else {
		 return inputString;
	}
}

export { buildCCPOrg, buildWallet, prettyJSONString };