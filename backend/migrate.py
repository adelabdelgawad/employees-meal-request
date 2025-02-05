from migration.amh import read_account
import asyncio
from icecream import ic


async def main():
    accounts = await read_account()
    ic(accounts)


if __name__ == "__main__":
    asyncio.run(main())
