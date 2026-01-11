# Librarian Love: Fantasy Tycoon 3

## Inspiration
In the age of decreasing readership, we wished to gamify reading by combining our love for romance light novels and modern gacha games. Inspired by one of our member's endless determination in overcoming his dyslexia disability, and his simultaneous love for gacha games, we reward players for progressing through book chapters with a mysterious story line and fun characters.

## What it does
Players input the book that they are currently reading. The player wakes up in a strange library, greeted by a girl named Marina. She gives us gems, the game's currency. We can collect more gems by logging more chapters that we read. The gems can be exchanged for a clue. 

The clue unlocks news rooms, where we meet new characters. If we pass a character's quiz (on the chapters we have read), they will be very impressed and join our party! Unlocking rare characters can unlock powerful hints and power boosts...

Collect every character by reading and traversing through this mysterious library! 

## How we built it
- Gemini API to parse inputted books. Based on the text, we generate quiz questions. 
- Cursor to build a light novel frontend with React. 
- Procreate to draw the original characters and talking animations

## Challenges we ran into
The biggest challenge was creating questions through a book ePUB file. They had to be coherent and consistent with the player's progress through the book. We overcame this through ensuring that the prompts were only based on the chapters that the players have recorded as read. 

## Accomplishments that we're proud of
We are proud of the original fully hand-drawn digital art, dialogue, and thematic design! We put much effort into replicating the classic visual novel style while creating a brand new storyline, word lore, and character personalities. All characters are fully original, with a special cameo from Light Yagami from the hit series, Death Note. 

## What we learned
As a beginner hackathon team with no CS majors (all 4 of us have background primarily in the life sciences; midway through, two members had to go to lab to check on their mice experiments), we learned how to use Gemini API effectively, text parsing with LLMs, and in general, how to make a visual novel from scratch. 

## What's next for Librarian Love: Fantasy Tycoon 3
We are planning on creating Librarian Love: Fantasy Tycoon 4 with a more expansive world, more characters, music, audio dialogue, more immersive conversation experiences with fully animated characters. 

We would love to have Goodreads integration for a more expansive library experience, where the game can be used as a private book rating and review log. 

Inspired by highly profitable and popular gacha (lootbox) games, we will also implement more gacha features, such as ways to purchase gems with real-world currency. 
