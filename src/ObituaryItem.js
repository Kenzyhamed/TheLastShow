import { NavLink } from "react-router-dom";
import FormattedDate from "./FormattedDate";
 
const changeSymbol = () => {

};

const playAudio =(audioLink)=>{
  let audio = new Audio(audioLink)
  audio.play()
}





function ObituaryItem({name, obituaryBorn, obituaryDied,image, id, audioLink,body}) {
  return (
    <li className="note-item"  key={`obituary-${id}`}>
       <div>
        <img id="photo" src={image}/>
        <p id="note-title">{name}</p>
        <div id="date-obituary"><FormattedDate date={obituaryBorn} /> - <FormattedDate date={obituaryDied} /></div>
        <p id='body'>{body}</p>
        <div id="sound" dangerouslySetInnerHTML={{__html: "&#9654;"}} onClick={playAudio(audioLink)}/>
        </div>
    </li>

  );
}

export default ObituaryItem;