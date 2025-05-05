import { Effect, Random, pipe, Stream, Option, Record } from 'effect';
import { createHash } from 'node:crypto';
import { WebSdk } from '@effect/opentelemetry';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { NodeRuntime } from '@effect/platform-node';


const otlUrl = process.env.OTEL_URL ? `${process.env.OTEL_URL}/v1/traces` : undefined;

// Set up tracing with the OpenTelemetry SDK
const WebSdkLive = WebSdk.layer(() => ({

  resource: { serviceName: 'sandwich-finder' },

  spanProcessor: new BatchSpanProcessor(new OTLPTraceExporter({ url: otlUrl }))

}));


interface Block {
  blockTime: number;
  blockHeight: number;
  blockhash: string;
  parentSlot: number;
  previousBlockhash: string;
}

interface ProcessedBlock {
  height: number;
  blockTime: Date;
  hasSandwiches: boolean;
}


const generateBlockHash = (height: number) => createHash('md5').update(height.toString()).digest('hex');

const annotateProcessedBlock = (block: ProcessedBlock) => Effect.annotateCurrentSpan(Record.remove(block, 'blockTime'));

// Genesis block to start the chain
const genesisBlock: Block = {
  blockHeight: 0,
  blockTime: Date.now(),
  blockhash: generateBlockHash(0),
  previousBlockhash: generateBlockHash(0),
  parentSlot: 0
};


// Function to get the next block based on the previous one
const getNextBlock = (prevBlock: Block): Effect.Effect<Block> => pipe(
  Effect.succeed({
    blockTime: Date.now(),
    blockHeight: prevBlock.blockHeight + 1,
    blockhash: generateBlockHash(prevBlock.blockHeight + 1),
    previousBlockhash: prevBlock.blockhash,
    parentSlot: prevBlock.blockHeight
  }),
  Effect.delay(400)
);


// Convert getNextBlock Effect into a Stream
const blockStreamProgram = Stream.unfoldEffect(genesisBlock, (block) => pipe(
    block,
    getNextBlock,
    Effect.tap(() => Effect.annotateCurrentSpan('block', block.blockHeight)),
    Effect.withSpan('gen-block'),
    Effect.tap(() => Effect.logInfo(`Block generated ${block.blockHeight}`)),
    Effect.map((newBlock) => Option.some([block, newBlock]))
  )
);


const processBlockProgram = (block: Block): Effect.Effect<ProcessedBlock> => Random.nextBoolean
  .pipe(Effect.flatMap(hasSandwiches => Effect.succeed({
      blockTime: new Date(block.blockTime),
      hasSandwiches,
      height: block.blockHeight
    })),
    Effect.tap((block) => annotateProcessedBlock(block)),
    Effect.delay(200),
    Effect.withSpan('process-block'),
    Effect.tap((block) => Effect.logInfo(`Block processed ${block.height}`))
  );


const saveSandwichProgram = (block: ProcessedBlock): Effect.Effect<Option.Option<number>> =>
  Effect.succeed(block.height).pipe(
    Effect.tap(() => annotateProcessedBlock(block)),
    Effect.delay(2000),
    Effect.withSpan('input'),
    Effect.tap(slot => Effect.logInfo(`Block ${slot} inserted`)),
    Effect.when(() => block.hasSandwiches)
  );

// Fork programs for processing it parallel from main stream
const processAndSaveProgram = (block: Block) => pipe(
  block,
  processBlockProgram,
  Effect.flatMap((processedBlock) => saveSandwichProgram(processedBlock)),
  Effect.fork);


console.log('Starting program', process.env.OTEL_URL);
const program = blockStreamProgram.pipe(
  Stream.mapEffect((block) => processAndSaveProgram(block)),
  Stream.withSpan('block-process-group'),
  Stream.runDrain
);


// Run the program
NodeRuntime.runMain(program.pipe(Effect.provide(WebSdkLive)));

process.on('SIGINT', () => {
  console.log('Stopping program');
});
