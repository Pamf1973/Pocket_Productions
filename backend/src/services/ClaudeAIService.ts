import Anthropic from '@anthropic-ai/sdk';
import { env } from '../config/env';

let client: Anthropic | null = null;

function getClient(): Anthropic {
    if (!client) {
        if (!env.ANTHROPIC_API_KEY) {
            throw new Error('ANTHROPIC_API_KEY is not configured');
        }
        client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
    }
    return client;
}

const MODEL = 'claude-sonnet-4-20250514';

export class ClaudeAIService {
    /**
     * Generates a storyboard shot description from scene context.
     */
    async generateShotDescription(params: {
        sceneContext: string;
        shotType: string;
        style?: string;
        characterColors?: Record<string, string>;
    }): Promise<string> {
        const { sceneContext, shotType, style, characterColors } = params;

        const colorContext = characterColors
            ? `\nCharacter color associations: ${JSON.stringify(characterColors)}`
            : '';

        const response = await getClient().messages.create({
            model: MODEL,
            max_tokens: 500,
            messages: [
                {
                    role: 'user',
                    content: `You are a professional cinematographer and storyboard artist.

Generate a vivid, specific storyboard shot description for a ${shotType} shot.

Scene context: ${sceneContext}
${style ? `Visual style: ${style}` : ''}${colorContext}

Provide:
1. A concise shot description (2–3 sentences) describing composition, lighting, and action
2. Camera movement if any (static, slow push, handheld, etc.)
3. Emotional tone / mood

Format as JSON: { "description": "...", "cameraMovement": "...", "mood": "..." }`,
                },
            ],
        });

        const text =
            response.content[0].type === 'text' ? response.content[0].text : '';
        try {
            return JSON.parse(text);
        } catch {
            return text;
        }
    }

    /**
     * Generates a character backstory and sample dialogue.
     */
    async generateCharacterBackstory(params: {
        name: string;
        archetype: string;
        want?: string;
        need?: string;
        flaw?: string;
        wound?: string;
        logline?: string;
        genre?: string;
    }): Promise<{ backstory: string; sampleDialogue: string; ghost: string }> {
        const { name, archetype, want, need, flaw, wound, logline, genre } = params;

        const response = await getClient().messages.create({
            model: MODEL,
            max_tokens: 800,
            messages: [
                {
                    role: 'user',
                    content: `You are a professional screenwriter and story development consultant.

Create a rich character profile for a ${genre ?? 'drama'} film.

Character: ${name}
Archetype: ${archetype}
${logline ? `Logline: ${logline}` : ''}
${want ? `External want: ${want}` : ''}
${need ? `Internal need: ${need}` : ''}
${flaw ? `Flaw: ${flaw}` : ''}
${wound ? `Psychological wound: ${wound}` : ''}

Generate:
1. backstory (3–4 sentences — specific backstory that created the wound and flaw)
2. ghost (the haunting past event/memory — 1 sentence)
3. sampleDialogue (2–3 lines of revealing dialogue that shows their voice/flaw)

Respond as JSON: { "backstory": "...", "ghost": "...", "sampleDialogue": "..." }`,
                },
            ],
        });

        const text =
            response.content[0].type === 'text' ? response.content[0].text : '{}';
        try {
            return JSON.parse(text);
        } catch {
            return { backstory: text, sampleDialogue: '', ghost: '' };
        }
    }

    /**
     * Matches a scene description against available locations and ranks them.
     */
    async matchLocations(params: {
        sceneDescription: string;
        locations: Array<{ id: string; name: string; address?: string; description?: string }>;
    }): Promise<Array<{ locationId: string; score: number; reasoning: string }>> {
        const { sceneDescription, locations } = params;

        if (locations.length === 0) return [];

        const response = await getClient().messages.create({
            model: MODEL,
            max_tokens: 600,
            messages: [
                {
                    role: 'user',
                    content: `You are a location scout with deep knowledge of production logistics.

Scene to match: "${sceneDescription}"

Available locations:
${locations.map((l, i) => `${i + 1}. ${l.name}${l.address ? ` (${l.address})` : ''}${l.description ? ` — ${l.description}` : ''}`).join('\n')}

Rank each location by fit for this scene (score 0–10) and explain why briefly.

Respond as JSON array: [{ "locationId": "...", "score": 8, "reasoning": "..." }]
Use the exact locationId values: ${locations.map((l) => l.id).join(', ')}`,
                },
            ],
        });

        const text =
            response.content[0].type === 'text' ? response.content[0].text : '[]';
        try {
            const parsed = JSON.parse(text);
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    }

    /**
     * Suggests arc beats for a given arc template and logline.
     */
    async suggestArcBeats(params: {
        arcTemplateName: string;
        logline: string;
        genre?: string;
    }): Promise<Array<{ name: string; positionPct: number; description: string }>> {
        const { arcTemplateName, logline, genre } = params;

        const response = await getClient().messages.create({
            model: MODEL,
            max_tokens: 800,
            messages: [
                {
                    role: 'user',
                    content: `You are a script development consultant specializing in story structure.

Generate story beat suggestions for a ${genre ?? 'drama'} film using the ${arcTemplateName} framework.

Logline: ${logline}

Provide 6–8 specific story beats positioned on a 0–100 timeline.
Each beat should be specific to THIS story, not generic template beat names.

Respond as JSON array: [{ "name": "...", "positionPct": 12, "description": "..." }]`,
                },
            ],
        });

        const text =
            response.content[0].type === 'text' ? response.content[0].text : '[]';
        try {
            const parsed = JSON.parse(text);
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    }
}

export const claudeAIService = new ClaudeAIService();
