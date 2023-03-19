import { Router } from "express";

import { getContract } from "../utils/ledgerUtils";

const router = Router();

router.post("/create-new-malfunction", async(req, res) => {
    try{
        let id : string;
        let automobileId : string;
        let description : string;
        let price : string;

        try{
            id = req.body["id"] as string;
            if(id.length < 1)
                throw "";
        }catch(_){
            return res.status(400).send({message: "Id is a mandatory field!"});
        }

        try{
            automobileId = req.body["automobileId"] as string;
            if(automobileId.length < 1)
                throw "";
        }catch(_){
            return res.status(400).send({message: "AutomobileId is a mandatory field!"});
        }

        try{
            price = req.body["price"] as string;
            const priceFloat = parseFloat(price);
            if(isNaN(priceFloat) || priceFloat < 0)
                throw "";
        }catch(_){
            return res.status(400).send({message: "Price is a mandatory field that must be a positive real number!"});
        }

        try{
            description = req.body["description"] as string;
            if(description.length < 1)
                throw "";
        }catch(_){
            return res.status(400).send({message: "Description is a mandatory field!"});
        }

        const contract = await getContract();
        const result = await contract.submitTransaction("CreateMalfunction", id, description, automobileId, price);
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

router.patch("/fix-malfunction", async(req, res)=>{
    try{
        let id : string;
        let automobileId : string;

        try{
            id = req.body["id"] as string;
            if(id.length < 1)
                throw "";
        }
        catch(_){
            return res.status(400).send({message: "Id is a mandatory field!"});
        }

        try{
            automobileId = req.body["automobileId"] as string;
            if(automobileId.length < 1)
                throw "";
        }
        catch(_){
            return res.status(400).send({message: "AutomobileId is a mandatory field!"});
        }

        const contract = await getContract();
        const result = await contract.submitTransaction("FixMalfunction", automobileId, id);
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

router.get("/read-all-for/:automobileId", async(req, res)=>{
    try{
        let automobileId : string;
        try{
            automobileId = req.params.automobileId as string;
            if(automobileId.length < 1)
                throw "";
        }
        catch(_){
            return res.status(400).send({message: "AutomobileId is a mandatory field!"});
        }

        const contract = await getContract();
        const result = await contract.submitTransaction("ReadAutomobile", automobileId);
        try{
            return res.send(JSON.parse(result.toString()).currentMalfunctions);
        }catch(e){
            return res.send({ result: result.toString() })
        }
    }catch(e){
        console.error(`Error occurred: ${e}`);
        return res.send("Method invoke failed!");
    }
});

export { router };