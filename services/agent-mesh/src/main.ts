import { topicChallengeCreated, topicContentRequested, topicProgressLogged, topicContentGenerated, topicRewardUnlocked } from '@tinywins/shared';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - solclientjs has non-typed default export patterns
import * as solace from 'solclientjs';
import { PlannerAgent } from './agents/planner';
import { ContentAgent } from './agents/content';
import { AnalyticsAgent } from './agents/analytics';

export type Bus = {
  publish: (topic: string, data: any) => void;
};

type MeshEnv = {
  SOLACE_HOST?: string;
  SOLACE_VPN?: string;
  SOLACE_USERNAME?: string;
  SOLACE_PASSWORD?: string;
};

function required(name: keyof MeshEnv, env: MeshEnv) {
  const v = env[name];
  if (!v) throw new Error(`${name} env required`);
  return v;
}

async function main() {
  const env: MeshEnv = {
    SOLACE_HOST: process.env.SOLACE_HOST,
    SOLACE_VPN: process.env.SOLACE_VPN,
    SOLACE_USERNAME: process.env.SOLACE_USERNAME,
    SOLACE_PASSWORD: process.env.SOLACE_PASSWORD,
  };

  const factoryProps = new solace.SolclientFactoryProperties();
  factoryProps.profile = solace.SolclientFactoryProfiles.version10;
  solace.SolclientFactory.init(factoryProps);

  const session = solace.SolclientFactory.createSession({
    url: required('SOLACE_HOST', env),
    vpnName: required('SOLACE_VPN', env),
    userName: required('SOLACE_USERNAME', env),
    password: required('SOLACE_PASSWORD', env),
    generateSendTimestamps: true,
  });

  await new Promise<void>((resolve, reject) => {
    session.on(solace.SessionEventCode.UP_NOTICE, () => resolve());
    session.on(solace.SessionEventCode.LOGIN_FAILURE, (e: any) => reject(e));
    session.connect();
  });
  console.log('Agent Mesh connected to Solace');

  const bus: Bus = {
    publish: (topic: string, data: any) => {
      const msg = solace.SolclientFactory.createMessage();
      msg.setDestination(solace.SolclientFactory.createTopicDestination(topic));
      msg.setBinaryAttachment(new TextEncoder().encode(JSON.stringify(data)));
      session.send(msg);
    },
  };

  const planner = new PlannerAgent(bus);
  const content = new ContentAgent(bus);
  const analytics = new AnalyticsAgent(bus);

  // Subscribe to topics
  const topics = [
    topicChallengeCreated('>'),
    topicContentRequested('>'),
    topicProgressLogged('>'),
  ];
  for (const t of topics) {
    session.subscribe(solace.SolclientFactory.createTopicDestination(t), true, t, 10000);
  }

  session.on(solace.SessionEventCode.MESSAGE, (msg: any) => {
    const topic = msg.getDestination().getName();
    const payload = msg.getBinaryAttachment() ? new TextDecoder().decode(msg.getBinaryAttachment()) : '{}';
    try {
      const data = JSON.parse(payload);
      planner.handle(topic, data);
      content.handle(topic, data);
      analytics.handle(topic, data);
    } catch (e) {
      console.error('Failed to handle message', e);
    }
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
