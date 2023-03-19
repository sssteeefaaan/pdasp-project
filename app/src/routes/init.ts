import { Router } from "express";

import { getContract } from "../utils/ledgerUtils";

const router = Router();

router.post("/ledger", async(_, res) => {
    try{
        const contract = await getContract();
        const result = await contract.submitTransaction("InitLedger");
        try{
            return res.send(JSON.parse(result.toString()));
        }catch(e){
            return res.send({ result: result.toString() })
        }
    }catch(e){
        console.error(`Error occurred: ${e}`);
        return res.send("Method invoke failed!");
    }
});

export { router };