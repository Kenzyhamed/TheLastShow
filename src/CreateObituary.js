import {useState, useEffect } from "react";
import { currentDate } from "./utils";
import { v4 as uuidv4 } from "uuid";


function CreateObituary({ collapse, setCollapse, obituaries, setObituaries, setAudioLink}) {

    const [obituaryBorn, setObituaryBorn] = useState("");
    const [obituaryDied, setObituaryDied] = useState();
    const [name,setName]= useState("");
    const [selectedFile, setSelectedFile] = useState(null);
    const [id, setID]=useState();


    const handleFileSelect = (event) => {
      setSelectedFile(event.target.files[0]);
    };
    


    const addObituaries = async() => {
      const data = new FormData();
      data.append("image", selectedFile);
      data.append("name", name);
      data.append("born_year", obituaryBorn);
      data.append("died_year", obituaryDied);
      data.append("id", uuidv4());
      
      
    const res = await fetch(
        "https://jdyzgm2v4f6k5s7vdqbqb5kqom0imlyg.lambda-url.ca-central-1.on.aws/",
          {
            method: "POST",
            "body": data
          }
        );

        const resJson = await res.json();
        setAudioLink(res["audio"])
        const newItem = { 
          ["id-obituary"]: resJson["id-obituary"],
          deadName: resJson.deadName,
          description: resJson.description,
          deadBirth: resJson.deadBirth,
          deadDeath: resJson.deadDeath,
          imageDeath: resJson.imageDeath,
          voice: resJson.voice
        }
        setObituaries([newItem, ...obituaries.reverse()])
        setCollapse(false);

      };
      
      
      

      const onSubmitForm = (event )=>{
        event.preventDefault();
         addObituaries();
      }
    return<div id="container" >


          <p id="close" onClick={() => setCollapse(false)}>X</p>
            <div id="write">
                <h2 id="create-title">Create a New Obituary</h2>
                <img id="decoration" src="https://trbahadurpur.com/wp-content/uploads/2021/02/q29.png" ></img><br></br>
                <form onSubmit={(e) => onSubmitForm(e)}>
                    <div>
                        <p  id= "image-select" onClick={() => { document.getElementById('imageInput').click(); }}>Select an image for the deceased {selectedFile && ( <span>({selectedFile.name})</span>)}</p><br></br>
                        <input type="file" id="imageInput" accept="image/*" onChange={handleFileSelect} style={{display: 'none'}} />

                    </div>
                      <input type="text" id="name" placeholder="Name of the deceased"  onChange={(event) => setName(event.target.value)} required/><br></br>
                    <div id="date">
                          <label><em>Born:</em></label>
                          <input
                          id= "born"
                          type="datetime-local"
                          value={obituaryBorn ? obituaryBorn : ""}
                          onChange={(event) => setObituaryBorn(event.target.value)} required/>


                        <label ><em>Died:</em></label>
                        <input
                        id= "died"
                        type="datetime-local"
                        value={obituaryDied ? obituaryDied : ""}
                        onChange={(event) => setObituaryDied(event.target.value)} required/>
                     
                    </div>

                  <button type="submit "id="create-obituary" >Write Obituary</button>
                </form>

        </div>
    </div>;
    
    
    
   
}
export default CreateObituary;