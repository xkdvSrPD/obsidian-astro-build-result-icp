const articles = {
  observe: {
    code: '2026—017', category: 'AI 与工具 / 2026.11.01',
    title: '当软件开始观察我们，我们还剩下什么？',
    lead: '我们习惯把软件理解成被动工具：点击按钮，它才开始工作。但新的系统正在观察上下文、推测意图，并在我们开口之前给出行动。',
    paragraphs: ['这种变化最容易被描述为“智能”。然而从使用者的角度看，更重要的变化是权力从哪里发生：当系统开始替我们筛选、排序和预测，它也开始参与定义什么值得看见。','而是谁可以修正它的判断。一个值得信任的工具，不应该只给出漂亮的答案，还应该让人知道答案来自哪里，允许人保留异议，也允许过去的决定被重新解释。','这也是个人博客仍然重要的原因。它不需要假装每一次记录都是最终结论。今天的判断可以在未来被修正，而旧文章会保留变化发生的证据。']
  },
  judgement: {
    code: '2026—016', category: '产品思考 / 2026.10.24',
    title: '复杂系统里，真正稀缺的是判断',
    lead: '当信息获取的成本不断下降，真正昂贵的部分变成了决定：什么重要，什么可以暂时忽略，什么根本不应该被做。',
    paragraphs: ['复杂系统并不会因为信息更多而自然变清晰。没有判断的收集，只会制造更完整的噪声。','设计者的价值不只在于整理已有信息，还在于公开自己的优先级，并承担选择带来的后果。','好的系统不会假装覆盖一切。它会让边界变得可见，也让未来的修改保留入口。']
  },
  workflow: {
    code: '2026—015', category: 'AI 与工具 / 2026.10.12',
    title: '我为什么不再把 AI 当成搜索框',
    lead: '搜索框期待一个问题和一个答案；协作对象则需要上下文、来回修正，以及对过程的共同记忆。',
    paragraphs: ['真正有用的改变，不是让模型回答更多问题，而是让它进入工作的中间状态：草稿、犹豫、约束和未完成的判断。','这也意味着使用者不能只负责发出指令。我们仍然需要解释目标、检查偏差，并决定什么时候不应该继续。','工具进入流程之后，效率不是唯一结果。它还会重新塑造我们描述问题的方式。']
  },
  website: {
    code: '2026—014', category: '独立开发 / 2026.09.28',
    title: '做一个安静但可靠的个人网站',
    lead: '平台负责分发，个人网站负责记忆。它不需要每天更新，但应该在几年后仍然能够打开。',
    paragraphs: ['一个可靠的网站首先是可以被自己维护的。技术选择应该服务于长期保存，而不是短期的新鲜感。','安静不等于缺少表达。相反，它让文章、归档和作者之间的关系成为真正的界面。','当外部平台改变规则时，自己的域名和内容仍然是一条可返回的路径。']
  },
  relations: {
    code: '2026—013', category: '设计 / 2026.09.05',
    title: '从接口到关系：重新理解产品设计',
    lead: '界面是关系的可见部分。每一个按钮背后，都连接着角色、权限、时间和一组没有显示出来的假设。',
    paragraphs: ['只讨论组件，会让设计看起来像表面的排列问题。但真正困难的部分，通常发生在系统如何理解人。','好的界面帮助人看见行动会影响谁、数据来自哪里，以及错误发生后如何返回。','当关系被理解，视觉形式往往会变得更简单，因为它不再需要掩盖结构上的混乱。']
  },
  context: {
    code: '2026—012', category: '工作方法 / 2026.08.17',
    title: '如何为长期项目保留上下文',
    lead: '任务列表只保存下一步行动，上下文则保存我们为什么走到这里。后者才是重新进入长期项目的入口。',
    paragraphs: ['项目停滞之后，最昂贵的不是重新开始工作，而是重新理解过去的决定。','一份短小的决策记录、仍然保留的失败方案，以及清楚的当前状态，都会减少这种恢复成本。','长期项目不需要记住一切，但需要知道哪些信息足以让未来的自己继续判断。']
  }
};

function updateClock() {
  const time = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Shanghai', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
  }).format(new Date());
  document.querySelectorAll('[data-clock]').forEach((node) => { node.textContent = time; });
}

function openArticle(key) {
  const article = articles[key];
  if (!article) return;
  document.querySelector('#reader-code').textContent = article.code;
  document.querySelector('#reader-category').textContent = article.category;
  document.querySelector('#reader-title').textContent = article.title;
  document.querySelector('#reader-lead').textContent = article.lead;
  const body = document.querySelector('#reader-body');
  const paragraphs = body.querySelectorAll('p');
  paragraphs.forEach((node, index) => { node.textContent = article.paragraphs[index]; });
  document.querySelector('#reader').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

document.querySelectorAll('[data-article]').forEach((button) => {
  button.addEventListener('click', () => openArticle(button.dataset.article));
});

document.querySelectorAll('form').forEach((form) => {
  form.addEventListener('submit', (event) => event.preventDefault());
});

const backTop = document.querySelector('.back-top');
backTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
window.addEventListener('scroll', () => {
  backTop.classList.toggle('visible', window.scrollY > window.innerHeight * .8);
}, { passive: true });

const trackedSubjects = [...document.querySelectorAll('.hero .subject-box')];
let jitterIndex = 0;
setInterval(() => {
  const subject = trackedSubjects[jitterIndex % trackedSubjects.length];
  subject.style.transform = `translate(${jitterIndex % 2 ? 1 : -1}px, ${jitterIndex % 3 === 0 ? 1 : 0}px)`;
  setTimeout(() => { subject.style.transform = ''; }, 110);
  jitterIndex += 1;
}, 2300);

updateClock();
setInterval(updateClock, 1000);
