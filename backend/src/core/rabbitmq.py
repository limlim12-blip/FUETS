import aio_pika
import asyncio
import json
from src.core.config import config
import logging

logger = logging.getLogger(__name__)


class RabbitMQClient:
    """
    https://fhrzn.github.io/posts/pain-free-python-fastapi-rmq-integration/
    consumer will be writen in go (hopefuly)
    """

    def __init__(self, queue_name: str, exchange_name: str, conn_str: str) -> None:
        self.queue_name = queue_name
        self.exchange_name = exchange_name
        self.conn_str = conn_str

        self.connection = None
        self.channel = None
        # https://rabbitgui.com/blog/rabbitmq-exchange-types-explained
        self.exchange = None
        self.queue = None

    async def start_connection(self):
        logger.info("Starting a new connection")
        self.connection = await aio_pika.connect_robust(url=self.conn_str)

        logger.info("Opening a new channel")
        self.channel = await self.connection.channel()

        logger.info("Declaring an exchange: %s" % self.exchange_name)
        self.exchange = await self.channel.declare_exchange(
            name=self.exchange_name, type=aio_pika.ExchangeType.DIRECT
        )
        await self.setup_queue()

    async def setup_queue(self):
        logger.info("Setup a queue: %s" % self.queue_name)
        self.queue = await self.channel.declare_queue(name=self.queue_name)  # type:ignore

        logger.info("Bind queue to exchange")
        await self.queue.bind(self.exchange)  # type:ignore

    async def close(self):
        if self.connection:
            await self.connection.close()
            print("RabbitMQ connection closed.")

    async def disconnect(self):
        try:
            if not self.connection.is_closed:  # type:ignore
                await self.connection.close()  # type:ignore
        except Exception as _e:
            logger.error(_e)

    async def start_producer(self):
        await self.start_connection()
        logger.info("Producer has been started")

        return self

    async def publish_message(self, message):
        await self.exchange.publish(  # type:ignore
            aio_pika.Message(body=message.encode()), routing_key=self.queue_name
        )

    # async def start_consumer(self):
    #     await self.start_connection()
    #
    #     await self.channel.set_qos(prefetch_count=1)  # type:ignore
    #
    #     logger.info("Starting consumer")
    #     await self.queue.consume(self.handle_message)  # type:ignore
    #
    #     logger.info("Consumer has been started")
    #
    #     return self
    #
    # async def handle_message(self, message: aio_pika.abc.AbstractIncomingMessage):
    #
    #     await asyncio.sleep(10)
    #
    #     logger.info("Consumer: Got message from producer: %s" % message.body.decode())
    #
    #     await message.ack()


# Create a global instance
mq_client = RabbitMQClient(
    queue_name="test.queue",
    exchange_name="test.exchange",
    conn_str=config.RABBITMQ_URL,
)
