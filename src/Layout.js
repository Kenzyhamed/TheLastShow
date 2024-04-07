import {  useState, useEffect } from "react";
import CreateObituary from "./CreateObituary";
import ObituaryBox from "./ObituaryBox";


function Layout() {
  const [obituaries, setObituaries] = useState([]);
  const [collapse, setCollapse] = useState(false);
  const[audioLink, setAudioLink]=useState("");

  useEffect(() => {
    const retrive = async () => {
        const res = await fetch(
            "https://uvb6q4qjuqksmgqhra4nippery0hodmx.lambda-url.ca-central-1.on.aws/",
            {
              method: "GET",
              headers: {
                "Content-Type" : "application/json",
              },
            }
          );

          const resJson = await res.json();
          setObituaries(resJson);
    };
    retrive(); 
}, []); 
  return  <div>

            <header >
              <aside>&nbsp;</aside>
                <div id="app-header">
                  <h1>
                  The Last Show
                  </h1>
                </div>
                <aside>
                  <button id="menu-button" onClick={() => setCollapse(true)}   className={collapse ? "noHover " : "" }>
                    + New Obituary
                  </button>
                </aside>
            </header>
            <ObituaryBox obituaries={obituaries} audioLink={audioLink}/>
            {collapse ?(<CreateObituary collapse={collapse} setCollapse={setCollapse} obituaries={obituaries} setObituaries={setObituaries} audioLink={audioLink} setAudioLink={setAudioLink}/> ):("")}


          </div>;
  }
  
  export default Layout;