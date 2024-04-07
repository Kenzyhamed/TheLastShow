import ObituaryItem from "./ObituaryItem";
import Empty from "./Empty";

function ObituaryBox({ obituaries, audioLink}) {
  return obituaries.length > 0 ? (
    <ul>
        {obituaries.reverse().map((obituary) => (
        <ObituaryItem name={obituary.deadName} obituaryDied={obituary.deadDeath} obituaryBorn={obituary.deadBirth} id={obituary["id-obituary"]} image={obituary.imageDeath} body={obituary.description} audioLink={obituary.voice} key={`obituary-${obituary.id}`} />
        ))}
    </ul>
  ) : (<Empty/>);
}

export default ObituaryBox;