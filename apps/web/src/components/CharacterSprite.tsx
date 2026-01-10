interface Character {
  id: string;
  name: string;
  sprite?: string;
  position?: "left" | "center" | "right";
}

interface CharacterSpriteProps {
  character: Character;
}

export function CharacterSprite({ character }: CharacterSpriteProps) {
  const position = character.position || "center";
  
  return (
    <div className={`character-sprite character-${position}`}>
      {character.sprite ? (
        <img src={character.sprite} alt={character.name} />
      ) : (
        <div className="character-placeholder">
          <div className="character-name">{character.name}</div>
        </div>
      )}
    </div>
  );
}