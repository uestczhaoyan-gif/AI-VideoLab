import { createRoutingProject } from '../../shared/routing.mjs';

const strings = ['topic', 'purpose', 'audience', 'context', 'duration', 'aspect', 'style', 'tone', 'usage', 'budget', 'deadline', 'max-wait'];
export const routingOptions = Object.fromEntries(strings.map((key) => [key, { type: 'string' }]));

export function projectFromArgs(values) {
  const optionalNumber = (value) => value === undefined ? undefined : value.trim() ? Number(value) : NaN;
  return createRoutingProject({
    topic: values.topic,
    purpose: values.purpose,
    audience: values.audience,
    viewing_context: values.context,
    duration_seconds: optionalNumber(values.duration),
    aspect_ratio: values.aspect,
    style_preferences: values.style,
    tone: values.tone,
    usage: values.usage,
    budget: optionalNumber(values.budget),
    deadline: values.deadline,
    max_wait_minutes: optionalNumber(values['max-wait']),
  });
}
