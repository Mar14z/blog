const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { spawn } = require('child_process');
const path = require('path');

const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || '';
const DEPLOY_SCRIPT = path.join(__dirname, '..', '..', 'scripts', 'deploy.sh');

// 校验 GitHub 签名（X-Hub-Signature-256）
function verifySignature(req) {
  if (!WEBHOOK_SECRET) {
    // 未配置 secret 则跳过校验（仅开发环境用）
    return { ok: true, reason: 'no-secret-configured' };
  }
  const signature = req.headers['x-hub-signature-256'];
  if (!signature) return { ok: false, reason: 'missing-signature' };

  const hmac = crypto.createHmac('sha256', WEBHOOK_SECRET);
  // rawBody 是 express.json 在 verify 钩子里塞进来的
  const payload = req.rawBody || JSON.stringify(req.body);
  hmac.update(payload);
  const expected = 'sha256=' + hmac.digest('hex');

  try {
    return {
      ok: crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected)),
      reason: 'ok'
    };
  } catch (err) {
    return { ok: false, reason: 'signature-compare-error: ' + err.message };
  }
}

// 触发部署（异步执行，不阻塞 webhook 响应）
function triggerDeploy(eventType) {
  return new Promise((resolve) => {
    const child = spawn('bash', [DEPLOY_SCRIPT], {
      env: { ...process.env, WEBHOOK_EVENT: eventType },
      detached: true,
      stdio: ['ignore', 'ignore', 'ignore']
    });
    child.unref();
    // 立刻 resolve，让 webhook 不等部署完成
    resolve({ pid: child.pid });
  });
}

router.post('/github', async (req, res) => {
  const event = req.headers['x-github-event'];

  // 只处理 push 事件
  if (event !== 'push') {
    return res.status(200).json({ code: 200, message: `ignored event: ${event}` });
  }

  // 分支过滤：只处理 master
  const ref = req.body && req.body.ref;
  if (ref !== 'refs/heads/master') {
    return res.status(200).json({ code: 200, message: `ignored ref: ${ref}` });
  }

  // 签名校验
  const verify = verifySignature(req);
  if (!verify.ok) {
    console.warn('[webhook] signature verification failed:', verify.reason);
    return res.status(401).json({ code: 401, message: '签名校验失败' });
  }

  // 触发了，开始部署
  const headCommit = (req.body && req.body.head_commit && req.body.head_commit.id) || 'unknown';
  const pusher = (req.body && req.body.pusher && req.body.pusher.name) || 'unknown';
  console.log(`[webhook] push from ${pusher}, head=${headCommit.substring(0, 7)}, deploying...`);

  const { pid } = await triggerDeploy('push');

  res.json({
    code: 200,
    message: '部署已触发',
    data: {
      commit: headCommit,
      pusher,
      deployPid: pid,
      logPath: '/opt/blog/logs/deploy.log'
    }
  });
});

// 健康检查
router.get('/health', (req, res) => {
  res.json({ code: 200, message: 'webhook ok', secretConfigured: !!WEBHOOK_SECRET });
});

module.exports = router;
