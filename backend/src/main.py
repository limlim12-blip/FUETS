from fastapi import FastAPI
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware
from src.core.db import init_db
from src.core.logger import setup_logging
from src.api.main import router
from src.core.rabbitmq import mq_client
import aio_pika
import logging


@asynccontextmanager
async def lifespan(app: FastAPI):
    setup_logging()
    init_db()
    try:
        await mq_client.start_producer()
    except Exception as e:
        logging.error(f"Failed to connect to RabbitMQ: {e}")
        logging.warning("Continuing to boot the API without RabbitMQ...")
    yield
    await mq_client.close()


app = FastAPI(
    lifespan=lifespan,
)


@app.post("/publish")
async def publish_message(message: str) -> dict:
    await app.state.channel.default_exchange.publish(
        aio_pika.Message(body=message.encode()),
        routing_key="test_queue",
    )
    return {"status": "ok"}


@app.get("/consume")
async def consume_message() -> dict:
    queue = await app.state.channel.declare_queue(
        "test_queue",
        auto_delete=True,
    )
    message = await queue.get(timeout=5, fail=False)

    if message:
        await message.ack()
        return {"body": message.body.decode()}

    return {"body": None}


app.include_router(router)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For testing only
    allow_methods=["*"],
    allow_headers=["*"],
)
