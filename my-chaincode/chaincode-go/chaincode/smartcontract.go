package chaincode

import (
	"encoding/json"
	"fmt"
	"strings"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

// #begin region Defines

// Constants
const TypeAutomobile = "automobile"
const TypePerson = "person"
const TypeMalfunction = "malfunction"
const TotalQueryLimit = 1000

// Smart contract provided by github.com/hyperledger/fabric-contract-api-go/contractapi
type SmartContract struct {
	contractapi.Contract
}

// Automobile class
type Automobile struct {
	ID                  string                 `json:"id"`
	Brand               string                 `json:"brand"`
	Model               string                 `json:"model"`
	Year                int                    `json:"year"`
	Price               float64                `json:"price"`
	Color               string                 `json:"color"`
	OwnerID             string                 `json:"ownerId"`
	MalfunctionHistory  map[string]Malfunction `json:"malfunctionHistory"`
	CurrentMalfunctions map[string]Malfunction `json:"currentMalfunctions"`
}

// Person class
type Person struct {
	ID        string  `json:"id"`
	FirstName string  `json:"firstName"`
	LastName  string  `json:"lastName"`
	Email     string  `json:"email"`
	Assets    float64 `json:"assets"`
}

// Malfunction class
type Malfunction struct {
	ID          string  `json:"id"`
	Description string  `json:"description"`
	Price       float64 `json:"price"`
}

// Method defines
func (a *Automobile) GetJSON() ([]byte, error) {
	return json.Marshal(a)
}

func (p *Person) GetJSON() ([]byte, error) {
	return json.Marshal(p)
}

func (m *Malfunction) GetJSON() ([]byte, error) {
	return json.Marshal(m)
}

func (a *Automobile) GetId() string {
	return CreateId(TypeAutomobile, a.ID)
}

func (p *Person) GetId() string {
	return CreateId(TypePerson, p.ID)
}
func (m *Malfunction) GetId() string {
	return CreateId(TypeMalfunction, m.ID)
}

func CreateId(itemType, id string) string {
	return fmt.Sprintf("%s:%s", itemType, id)
}

// #end region -- Defines

// Check if an item exists

func (s *SmartContract) ItemExists(ctx contractapi.TransactionContextInterface, itemType, id string) (bool, error) {
	itemJSON, err := ctx.GetStub().GetState(CreateId(itemType, id))
	if err != nil {
		return false, fmt.Errorf("Failed to read item (%s) with id (%s) from world state: %v", itemType, id, err)
	}

	return itemJSON != nil, nil
}

// Automobile CRUD

func (s *SmartContract) CreateAutomobile(
	ctx contractapi.TransactionContextInterface,
	id, brand, model, color string,
	year int,
	price float64,
	ownerId string,
) (*Automobile, error) {
	exists, err := s.ItemExists(ctx, TypeAutomobile, id)
	if err != nil {
		return nil, err
	}
	if exists {
		return nil, fmt.Errorf("The automobile with id (%s) already exists!", id)
	}

	exists, err = s.ItemExists(ctx, TypePerson, ownerId)
	if err != nil {
		return nil, err
	}
	if !exists {
		return nil, fmt.Errorf("The owner with id (%s) doesn't exist!", ownerId)
	}

	automobile := Automobile{
		ID:                  id,
		Brand:               strings.Title(strings.ToLower(brand)),
		Model:               strings.Title(strings.ToLower(model)),
		Color:               strings.Title(strings.ToLower(color)),
		Year:                year,
		Price:               price,
		OwnerID:             ownerId,
		MalfunctionHistory:  make(map[string]Malfunction, 0),
		CurrentMalfunctions: make(map[string]Malfunction, 0),
	}

	automobileJSON, err := automobile.GetJSON()
	if err != nil {
		return nil, err
	}

	err = ctx.GetStub().PutState(automobile.GetId(), automobileJSON)
	if err != nil {
		return nil, fmt.Errorf("Failed to put automobile(%s) to world state: %v", automobile.ID, err)
	}

	return &automobile, nil
}

func (s *SmartContract) ReadAutomobile(
	ctx contractapi.TransactionContextInterface,
	id string,
) (*Automobile, error) {
	automobileJSON, err := ctx.GetStub().GetState(CreateId(TypeAutomobile, id))
	if err != nil {
		return nil, err
	}

	if automobileJSON == nil {
		return nil, fmt.Errorf("Automobile with id (%s) doesn't exist!", id)
	}

	automobile := Automobile{}
	err = json.Unmarshal(automobileJSON, &automobile)
	if err != nil {
		return nil, err
	}

	return &automobile, nil
}

func (s *SmartContract) ReadAllAutomobiles(ctx contractapi.TransactionContextInterface) ([]*Automobile, error) {
	automobilesIterator, err := ctx.GetStub().GetQueryResult(fmt.Sprintf("{\"selector\": {\"_id\": { \"$regex\": \"^(%s:)\" } } }", TypeAutomobile))
	if err != nil {
		return nil, err
	}
	defer automobilesIterator.Close()

	automobiles := make([]*Automobile, 0)
	for automobilesIterator.HasNext() {
		automobileJSON, err := automobilesIterator.Next()
		if err != nil {
			return automobiles, err
		}

		var automobile Automobile
		err = json.Unmarshal(automobileJSON.Value, &automobile)
		if err != nil {
			return automobiles, err
		}

		automobiles = append(automobiles, &automobile)
	}

	return automobiles, nil
}

func (s *SmartContract) ReadAutomobilesQuery(ctx contractapi.TransactionContextInterface, query string) ([]*Automobile, error) {
	automobilesIterator, err := ctx.GetStub().GetQueryResult(query)
	if err != nil {
		return nil, err
	}
	defer automobilesIterator.Close()

	automobiles := make([]*Automobile, 0)
	for automobilesIterator.HasNext() {
		automobileJSON, err := automobilesIterator.Next()
		if err != nil {
			return automobiles, err
		}

		var automobile Automobile
		err = json.Unmarshal(automobileJSON.Value, &automobile)
		if err != nil {
			return automobiles, err
		}

		automobiles = append(automobiles, &automobile)
	}

	return automobiles, nil
}

func (s *SmartContract) ColorAutomobile(ctx contractapi.TransactionContextInterface, id, color string) (*Automobile, error) {
	automobile, err := s.ReadAutomobile(ctx, id)
	if err != nil {
		return automobile, err
	}

	formattedColor := strings.Title(strings.ToLower(color))
	if automobile.Color == formattedColor {
		return automobile, fmt.Errorf("Automobile with id (%s) is already color '%s'!", id, formattedColor)
	}

	oldColor := automobile.Color
	automobile.Color = formattedColor

	automobileJSON, err := automobile.GetJSON()
	if err != nil {
		automobile.Color = oldColor
		return automobile, err
	}

	err = ctx.GetStub().PutState(automobile.GetId(), automobileJSON)
	if err != nil {
		automobile.Color = oldColor
		return nil, fmt.Errorf("Failed to put automobile(%s) to world state: %v", id, err)
	}

	return automobile, err
}

// Person CRUD
func (s *SmartContract) CreatePerson(
	ctx contractapi.TransactionContextInterface,
	id, firstName, lastName, email string,
	assets float64,
) (*Person, error) {
	exists, err := s.ItemExists(ctx, TypePerson, id)
	if err != nil {
		return nil, err
	}
	if exists {
		return nil, fmt.Errorf("The person with id (%s) already exists!", id)
	}

	person := Person{
		ID:        id,
		FirstName: strings.Title(strings.ToLower(firstName)),
		LastName:  strings.Title(strings.ToLower(lastName)),
		Email:     email,
		Assets:    assets,
	}

	personJSON, err := person.GetJSON()
	if err != nil {
		return nil, err
	}

	err = ctx.GetStub().PutState(person.GetId(), personJSON)
	if err != nil {
		return nil, fmt.Errorf("Failed to put person(%s) to world state: %v", person.ID, err)
	}

	return &person, nil
}

func (s *SmartContract) ReadPerson(
	ctx contractapi.TransactionContextInterface,
	id string,
) (*Person, error) {
	personJSON, err := ctx.GetStub().GetState(CreateId(TypePerson, id))
	if err != nil {
		return nil, err
	}

	if personJSON == nil {
		return nil, fmt.Errorf("Person with id (%s) doesn't exist!", id)
	}

	person := Person{}
	err = json.Unmarshal(personJSON, &person)
	if err != nil {
		return nil, err
	}

	return &person, nil
}

func (s *SmartContract) ReadAllPeople(ctx contractapi.TransactionContextInterface) ([]*Person, error) {
	peopleIterator, err := ctx.GetStub().GetQueryResult(fmt.Sprintf("{\"selector\": {\"_id\": { \"$regex\": \"^(%s:)\" } } }", TypePerson))
	if err != nil {
		return nil, err
	}
	defer peopleIterator.Close()

	people := make([]*Person, 0)
	for peopleIterator.HasNext() {
		personJSON, err := peopleIterator.Next()
		if err != nil {
			return people, err
		}

		var person Person
		err = json.Unmarshal(personJSON.Value, &person)
		if err != nil {
			return people, err
		}

		people = append(people, &person)
	}

	return people, nil
}

func (s *SmartContract) ReadPeopleQuery(ctx contractapi.TransactionContextInterface, query string) ([]*Person, error) {
	peopleIterator, err := ctx.GetStub().GetQueryResult(query)
	if err != nil {
		return nil, err
	}
	defer peopleIterator.Close()

	people := make([]*Person, 0)
	for peopleIterator.HasNext() {
		personJSON, err := peopleIterator.Next()
		if err != nil {
			return people, err
		}

		var person Person
		err = json.Unmarshal(personJSON.Value, &person)
		if err != nil {
			return people, err
		}

		people = append(people, &person)
	}

	return people, nil
}

func (s *SmartContract) ChangeAssetsPerson(ctx contractapi.TransactionContextInterface, id string, assetsDelta float64) (*Person, error) {
	person, err := s.ReadPerson(ctx, id)
	if err != nil {
		return person, err
	}
	if person.Assets+assetsDelta < 0 {
		return person, fmt.Errorf("Person with id (%s) doesn't have enough assets(%f vs. %f)!", id, person.Assets, assetsDelta)
	}
	person.Assets += assetsDelta
	personJSON, err := person.GetJSON()
	if err != nil {
		person.Assets -= assetsDelta
		return person, err
	}
	err = ctx.GetStub().PutState(person.GetId(), personJSON)
	if err != nil {
		person.Assets -= assetsDelta
		return nil, fmt.Errorf("Failed to put person(%s) to world state: %v", id, err)
	}
	return person, nil
}

// Malfunction CRUD / Transactions

func (s *SmartContract) CreateMalfunction(
	ctx contractapi.TransactionContextInterface,
	id, description, automobileId string,
	price float64,
) (*Automobile, error) {
	automobile, err := s.ReadAutomobile(ctx, automobileId)
	if err != nil {
		return automobile, err
	}

	_, exists := automobile.MalfunctionHistory[id]
	if exists {
		return automobile, fmt.Errorf("Malfunction with id (%s) is already linked to an automobile with id (%s)!", id, automobileId)
	}

	malfunction := Malfunction{
		ID:          id,
		Description: description,
		Price:       price,
	}

	automobile.Price -= malfunction.Price
	automobile.MalfunctionHistory[id] = malfunction
	automobile.CurrentMalfunctions[id] = malfunction

	if automobile.Price <= 0 {
		return automobile, ctx.GetStub().DelState(automobile.GetId())
	}

	automobileJSON, err := automobile.GetJSON()
	err = ctx.GetStub().PutState(automobile.GetId(), automobileJSON)
	if err != nil {
		automobile.Price += malfunction.Price
		delete(automobile.MalfunctionHistory, id)
		delete(automobile.CurrentMalfunctions, id)
		return nil, fmt.Errorf("Failed to put automobile(%s) to world state: %v", automobileId, err)
	}

	return automobile, nil
}

func (s *SmartContract) FixMalfunction(ctx contractapi.TransactionContextInterface, automobileId, malfunctionId string) (*Automobile, error) {
	automobile, err := s.ReadAutomobile(ctx, automobileId)
	if err != nil {
		return automobile, err
	}

	malfunction, exists := automobile.CurrentMalfunctions[malfunctionId]
	if !exists {
		return automobile, fmt.Errorf("Malfunction with id (%s) isn't apart of an automobile with id (%s) at the moment!", malfunctionId, automobileId)
	}

	person, err := s.ReadPerson(ctx, automobile.OwnerID)
	if err != nil {
		return automobile, err
	}

	if person.Assets < malfunction.Price {
		return automobile, fmt.Errorf("Person with id (%s) doesn't have enough assets (%f vs. %f) to fix the malfunction with id (%s) on an automobile with the id (%s)!", person.ID, person.Assets, malfunction.Price, malfunctionId, automobileId)
	}

	s.ChangeAssetsPerson(ctx, person.ID, -malfunction.Price)
	delete(automobile.CurrentMalfunctions, malfunctionId)
	automobile.Price += malfunction.Price

	automobileJSON, err := automobile.GetJSON()
	if err != nil {
		automobile.Price -= malfunction.Price
		automobile.CurrentMalfunctions[malfunctionId] = malfunction
		s.ChangeAssetsPerson(ctx, person.ID, malfunction.Price)
		return automobile, err
	}

	err = ctx.GetStub().PutState(automobile.GetId(), automobileJSON)
	if err != nil {
		automobile.Price -= malfunction.Price
		automobile.CurrentMalfunctions[malfunctionId] = malfunction
		s.ChangeAssetsPerson(ctx, person.ID, malfunction.Price)
		return nil, fmt.Errorf("Failed to put automobile(%s) to world state: %v", automobileId, err)
	}

	return automobile, nil
}

func (s *SmartContract) ChangeOwnership(ctx contractapi.TransactionContextInterface, automobileId, newOwnerId string, buyWithMalfunctions bool) (*Automobile, error) {
	automobile, err := s.ReadAutomobile(ctx, automobileId)
	if err != nil {
		return automobile, err
	}

	if automobile.OwnerID == newOwnerId {
		return automobile, fmt.Errorf("Automobile with id (%s) already belongs to the person with id (%s)!", automobileId, newOwnerId)
	}

	if !buyWithMalfunctions && len(automobile.CurrentMalfunctions) > 0 {
		return automobile, fmt.Errorf("Automobile %s has malfunctions which isn't allowed for this transaction!", automobileId)
	}

	newOwner, err := s.ReadPerson(ctx, newOwnerId)
	if err != nil {
		return automobile, err
	}

	if newOwner.Assets < automobile.Price {
		return automobile, fmt.Errorf("Person with id (%s) doesn't have enough assets for this transaction (%f vs. %f)!", newOwnerId, newOwner.Assets, automobile.Price)
	}

	newOwner, err = s.ChangeAssetsPerson(ctx, newOwnerId, -automobile.Price)
	if err != nil {
		return automobile, err
	}

	oldOwner, err := s.ChangeAssetsPerson(ctx, automobile.OwnerID, +automobile.Price)
	if err != nil {
		s.ChangeAssetsPerson(ctx, newOwnerId, +automobile.Price)
		return automobile, err
	}

	automobile.OwnerID = newOwnerId

	automobileJSON, err := automobile.GetJSON()
	if err != nil {
		s.ChangeAssetsPerson(ctx, newOwner.ID, +automobile.Price)
		s.ChangeAssetsPerson(ctx, oldOwner.ID, -automobile.Price)
		automobile.OwnerID = oldOwner.ID
		return automobile, err
	}

	err = ctx.GetStub().PutState(automobile.GetId(), automobileJSON)
	if err != nil {
		s.ChangeAssetsPerson(ctx, newOwner.ID, +automobile.Price)
		s.ChangeAssetsPerson(ctx, oldOwner.ID, -automobile.Price)
		automobile.OwnerID = oldOwner.ID
		return automobile, fmt.Errorf("Failed to put automobile(%s) to the world state: %v", automobileId, err)
	}

	return automobile, nil
}

// Init function -- Generates synthesis block
func (s *SmartContract) InitLedger(ctx contractapi.TransactionContextInterface) error {
	people := []Person{
		{ID: "0", FirstName: "Milica", LastName: "Pavlovic", Email: "milica.pavlovic@gmail.com", Assets: 3e6},
		{ID: "1", FirstName: "Novak", LastName: "Djokovic", Email: "novak.djokovic@gmail.com", Assets: 5e7},
		{ID: "2", FirstName: "Desanka", LastName: "Maksimovic", Email: "desanka.maksimovic@gmail.com", Assets: 45e5},
		{ID: "3", FirstName: "Vesna", LastName: "Vukilic", Email: "vesna.vukilic.vendi@gmail.com", Assets: 6e6},
	}

	for _, person := range people {
		personJSON, err := person.GetJSON()
		if err != nil {
			return err
		}

		err = ctx.GetStub().PutState(person.GetId(), personJSON)
		if err != nil {
			return fmt.Errorf("Failed to put person(%s) to world state: %v", person.ID, err)
		}
	}

	automobiles := []Automobile{
		{ID: "0", Brand: "Audi", Model: "Q7", Color: "Black", Price: 8e4, Year: 2017, OwnerID: "3", MalfunctionHistory: make(map[string]Malfunction, 0), CurrentMalfunctions: make(map[string]Malfunction, 0)},
		{ID: "1", Brand: "Fiat", Model: "500L", Color: "Red", Price: 25e3, Year: 2019, OwnerID: "1", MalfunctionHistory: make(map[string]Malfunction, 0), CurrentMalfunctions: make(map[string]Malfunction, 0)},
		{ID: "2", Brand: "Mercedes Benz", Model: "GLS", Color: "Grey", Price: 21e4, Year: 2021, OwnerID: "0", MalfunctionHistory: make(map[string]Malfunction, 0), CurrentMalfunctions: make(map[string]Malfunction, 0)},
		{ID: "3", Brand: "Dacia", Model: "Duster", Color: "Orange", Price: 19e3, Year: 2013, OwnerID: "1", MalfunctionHistory: make(map[string]Malfunction, 0), CurrentMalfunctions: make(map[string]Malfunction, 0)},
		{ID: "4", Brand: "Land Rover", Model: "Range Rover", Color: "White", Price: 14e4, Year: 2022, OwnerID: "2", MalfunctionHistory: make(map[string]Malfunction, 0), CurrentMalfunctions: make(map[string]Malfunction, 0)},
		{ID: "5", Brand: "Porsche", Model: "Panamera", Color: "Purple", Price: 14e4, Year: 2018, OwnerID: "0", MalfunctionHistory: make(map[string]Malfunction, 0), CurrentMalfunctions: make(map[string]Malfunction, 0)},
	}

	for _, automobile := range automobiles {
		automobileJSON, err := automobile.GetJSON()
		if err != nil {
			return err
		}

		err = ctx.GetStub().PutState(automobile.GetId(), automobileJSON)
		if err != nil {
			return fmt.Errorf("Failed to put automobile(%s) to world state: %v", automobile.ID, err)
		}
	}

	return nil
}
