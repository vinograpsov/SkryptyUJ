import discord
from discord import app_commands
import ollama 
from uuid import uuid4

import os 
from dotenv import load_dotenv
import asyncio

load_dotenv()

TOKEN = os.getenv("DISCORD_TOKEN")
MODEL = "llama3"
GUILD_ID = int(os.getenv("GUILD_ID"))


intents = discord.Intents.default()
client = discord.Client(intents=intents)
tree = app_commands.CommandTree(client)





db = {
    "tournaments": {
        "International DOTA 2 Championship": {
            "id": str(uuid4()),
            "prize": "5 000 000 $",
            "teams": {
                "Radiant": {"players": []},
                "Dire": {"players": []},
            },
        },
        "Fortnite World Cup": {
            "id": str(uuid4()),
            "prize": "300 000 $",
            "teams": {
                "VictoryRoyale": {"players": []},
                "BushBandits": {"players": []},
            },
        },
        "League of Legends World Championship": {
            "id": str(uuid4()),
            "prize": "2 250 000 $",
            "teams": {
                "T1": {"players": []},
                "G2 Esports": {"players": []},
            },
        },
        "Counter-Strike 2 Major Copenhagen": {
            "id": str(uuid4()),
            "prize": "1 000 000 $",
            "teams": {
                "NAVI": {"players": []},
                "Vitality": {"players": []},
            },
        },
        "Valorant Champions": {
            "id": str(uuid4()),
            "prize": "1 000 000 $",
            "teams": {
                "Sentinels": {"players": []},
                "LOUD": {"players": []},
            },
        },
    }
}


async def ask_llm(system_msg: str, user_msg: str) -> str:
    msgs = [
        {"role": "system", "content": system_msg},
        {"role": "user", "content": user_msg}
    ]
    loop = asyncio.get_running_loop()
    resp = await loop.run_in_executor(
        None,
        lambda: ollama.chat(model=MODEL, messages=msgs)
    )
    return resp['message']['content']


@tree.command(name="enter", description= "Enter a tournament")
async def enter(
    inter: discord.Interaction,
    tournament: str
):
    await inter.response.defer(thinking=True)

    if tournament not in db["tournaments"]:
        await inter.followup.send(f"Tournament '{tournament}' does not exist. Use /events to see available tournaments.")
        return
    
    sys = ("You are a tournament manager. You accept players, and answer them with friendly gamer slang. ")
    usr = (f"Player {inter.user.display_name} want to enter the tournament {tournament}. Ask him which team he wants to join (dont say team names) and etell him to use /enroll command to enroll in the team.")
    reply = await ask_llm(sys, usr)

    await inter.followup.send(reply[:2000])


@tree.command(name="events", description = "List all tournaments")
async def events(inter: discord.Interaction):
    await inter.response.defer(thinking=True)

    tour_rows = [
        f" **{name}** - prize {info['prize']}"
        for name, info in db["tournaments"].items()
    ]

    await inter.followup.send("\n".join(tour_rows))
    

@tree.command(name="enroll", description = "Enroll a team in a tournament")
async def enroll(
    inter: discord.Interaction,
    tournament: str, 
    team: str, 
    role: str = "player"
):
    await inter.response.defer(thinking=True)

    if tournament not in db["tournaments"]:
        await inter.followup.send(f"Tournament '{tournament}' does not exist.")
        return
    
    teams = db["tournaments"][tournament]["teams"]
    if team not in teams: 
        teams[team] = {"players": []}


    roster = teams[team]["players"]
    roster.append(inter.user)
    number = len(roster)

    sys = ("You are a tournament manager. You accept team member enrolment and giving player number and add some cybersport slang according to tournament game to the response. ")
    usr = (f"Player {inter.user.display_name} has enrolled in the team {team} for the tournament {tournament}. Under number {number} and role {role}. Accept this enrolment polietly and shortly.")
    reply = await ask_llm(sys, usr)

    await inter.followup.send(reply[:2000])


@tree.command(name="statust", description="Show current tournament standings", guild=discord.Object(id=GUILD_ID))
async def statust(inter: discord.Interaction):
    await inter.response.defer(thinking=True)
    lines: list[str] = []
    for t_name, t_info in db["tournaments"].items():
        lines.append(f"### {t_name} — prize {t_info['prize']}")
        if not t_info["teams"]:
            lines.append("_No teams registered yet._")
            continue

        for team_name, team_info in t_info["teams"].items():
            players = (
                ", ".join(player.display_name for player in team_info["players"]) or "—"
            )
            lines.append(f"* **{team_name}**: {players}")
        lines.append("")
    sys = (
        "You are a shout‑caster summarising the current brackets. Keep structure and markdown, add hype."
    )
    usr = "\n".join(lines)
    reply = await ask_llm(sys, usr)

    await inter.followup.send(reply[:2000])



@client.event
async def on_ready():
    guild = discord.Object(id=GUILD_ID)
    print(GUILD_ID)
    print(type(GUILD_ID))
    synced = await tree.sync(guild=guild)
    # await tree.sync()
    print(f"Bot is ready as {client.user}. Synced {len(synced)}")


client.run(TOKEN)



