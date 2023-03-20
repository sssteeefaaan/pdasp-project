<h1>Projekat iz predmeta <em><strong>Paralelni i distribuirani algoritmi i strukture podataka</strong></em></h1>

<h2>Opis projekta</h2>
<ul>
    <li>Projekat je rađen na virtuelnoj mašini na <strong><em>Google Cloud</em></strong> platformi. Ukoliko je neophodno, mogu proslediti IP adresu (nisam iznajmio statičku, pa se sa pokretanjem svaki put dodeli nova), za testiranje projekta.</li></br>
    <li>Servisni deo projekta je napisan na <em><strong>TypeScript-u</strong></em> i pokrenut u okviru <em><strong>Nodejs</strong></em> okruženja, na adresi <code><strong><a href="http://localhost:8080" >http://localhost:8080</a></strong></code>, odnosno <code><strong><a href="http://adresa-virtualne-mašine" >http://adresa-virtualne-mašine[:80]</a></strong></code>. Endpoint-i koje pruža ovaj servis podrazumevaju:
        <ul>
            <li><code><strong>[GET] /automobiles/read-all</strong></code></li>
            <li><code><strong>[GET] /automobiles/read-my-garage/:ownerId</strong></code></li>
            <li><code><strong>[GET] /automobiles/read-filtered/:color</strong></code></li>
            <li><code><strong>[GET] /automobiles/read-filtered/:color/:ownerId</strong></code></li>
            <li><code><strong>[GET] /automobiles/:id</strong></code></li>
            <li><code><strong>[GET] /people/read-all</strong></code></li>
            <li><code><strong>[GET] /people/read-filtered/:assets</strong></code></li>
            <li><code><strong>[GET] /people/:id</strong></code></li>
            <li><code><strong>[GET] /malfunctions/read-all-for/:automobileId</strong></code></li>
            <li><code><strong>[POST] /init/ledger</strong></code></li>
            <li><code><strong>[POST] /automobiles/create-new-automobile</strong></code></li>
            <li><code><strong>[POST] /people/create-new-person</strong></code></li>
            <li><code><strong>[POST] /malfunctions/create-new-malfunction</strong></code></li>
            <li><code><strong>[PATCH] /automobiles/change-color</strong></code></li>
            <li><code><strong>[PATCH] /automobiles/change-ownership</strong></code></li>
            <li><code><strong>[PATCH] /malfunctions/fix-malfunction</strong></code></li>
        </ul>
    </li></br>
    <li><strong>Hyperledger Fabric</strong> mreža, odgovorna za transakcije se sastoji iz:
        <ul>
            <li>Kanala (mreže) pod nazivom <strong><em>pdasp</em></strong> na koji su povezani neophodni peer-ovi.</li></br>
            <li><strong>Smart contract-a</strong> napisanog na programskom jeziku <strong>Go</strong>. Izvorni kod se nalazi na putanji <strong>./my-chaincode/chaincode-go/chaincode/smartcontract.go</strong></li></br>
            <li>Četiri organizacije, obeležene sa <strong>org1-4</strong>. U okviru svake od njih se nalazi:
                <ul>
                    <li>Po četiri čvora (peer), koji su označeni sa <strong>peer0-3</strong>. Svakom od čvorova je pridružena po jedna instanca baze podataka za složenije upite (<strong>CouchDB</strong>). Ovi kontejneri su označeni sa <strong>couchdb$n$m</strong>, gde je <strong>n</strong> broj organizacije, a <strong>m</strong> broj čvora kome je instanca pridružena.</li>
                    <li><strong>Certificate Authority</strong>, odgovoran za organizaiju. Nosi oznaku <strong>ca_org$n</strong>.</li>
                </ul>
            </li></br>
            <li><strong>Orderer-a</strong>, koji je obeležen kao <strong>orderer</strong> i kome je pridružena <strong>Certificate Authority</strong> instanca, obeležena kao <strong>ca_orderer</strong>.</li>
        </ul>
    </li>
</ul></br>

<h2>Pokretanje blockchain mreže</h2>
<ol>
    <li>Pozicionirati se u okviru direktorijuma <strong>./my-chaincode</strong></br>
        <code><strong>cd</strong> ./my-chaincode</code></li>
    <li>Pokrenuti skriptu za podizanje mreže</br>
        <code><strong>./network.sh</strong> up</code></li>
    <li>Pokrenuti kreiranje kanala</br>
        <code><strong>./network.sh</strong> createChannel -c pdasp</code></li>
    <li>Predati chaincode peer-ovima</br>
        <code><strong>./network.sh</strong> deployCC -c pdasp -ccn blockchain -ccp ./chaincode-go -ccl go -ccv 1 -ccs 1</code></li>
</ol>

<h2>Pokretanje servisa (SDK)</h2>
<ol>
    <li>Pozicionirati se u okviru direktorijuma <strong>./app</strong></br>
        <code><strong>cd</strong> ./app</code></li>
    <li>Skinuti pakete</br>
        <code><strong>npm</strong> install</code></li>
    <li>Kompajlirati TypeScript program iz <strong>./src</strong> direktorijuma u ./dist direktorijum komandom</br>
        <code><strong>npm</strong> run build</code></li>
    <li>U posebnoj konzoli, pokrenuti server komandom</br>
        <code><strong>npm</strong> run start</code></li>
</ol>

<h2>Inicijalizacija ledger-a</h2>
<h3>Kao i za ostale upite, važi da se poziv može ostvariti na dva načina:</h3>
<ol>
    <li>Kroz upit na odgovarajući endpoint servisa, sa bilo kog uređaja koji ima pristup adresi mašine</br>
        <code><strong>[POST] <a href="http://adresa-mašine/init/ledger">http://adresa-mašine/init/ledger</a></strong></code></li></br>
    <li>Kroz konzolu na mašini na kojoj je pokrenuta <strong>Hyperledger Fabric</strong> mreža
        <ol>
            <li>Pozicionirati se u okviru <strong>./my-chaincode</strong> direktorijuma</br>
                <code><strong>cd</strong> ./my-chaincode</code></li>
            <li>Deklarisati neophodne promenljive okruženja (ovo se radi samo jednom na nivou konzole). Po zahtevu, promenljive su usklađene tako da se okidanje koda izvršava kroz <strong>organizaciju 4</strong>.</br>
            <code><strong>export</strong> PATH=${PWD}/bin:$PATH &&\
<strong>export</strong> FABRIC_CFG_PATH=$PWD/config/ &&\
<strong>export</strong> CORE_PEER_TLS_ENABLED=true &&\
<strong>export</strong> CORE_PEER_LOCALMSPID="Org4MSP" &&\
<strong>export</strong> CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org4.example.com/peers/peer0.org4.example.com/tls/ca.crt &&\
<strong>export</strong> CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org4.example.com/users/Admin@org4.example.com/msp &&\
<strong>export</strong> CORE_PEER_ADDRESS=localhost:10050</code></li>
            <li>Konačno, pozivanje metoda na mreži</br>
            <code><strong>peer</strong> chaincode invoke \
-o localhost:7000 \
--ordererTLSHostnameOverride orderer.example.com \
--tls \
--cafile "${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem" \
-C pdasp \
-n blockchain \
--peerAddresses localhost:7050 \
--tlsRootCertFiles "${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt" \
--peerAddresses localhost:8050 \
--tlsRootCertFiles "${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt" \
--peerAddresses localhost:9050 \
--tlsRootCertFiles "${PWD}/organizations/peerOrganizations/org3.example.com/peers/peer0.org3.example.com/tls/ca.crt" \
--peerAddresses localhost:10050 \
--tlsRootCertFiles "${PWD}/organizations/peerOrganizations/org4.example.com/peers/peer0.org4.example.com/tls/ca.crt" \
-c '{"function":"InitLedger","Args":[]}'</code></li>
        </ol>
    </li>
</ol>