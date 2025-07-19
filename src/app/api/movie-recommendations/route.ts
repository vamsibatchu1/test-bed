import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a movie expert. Provide accurate, recent movie recommendations in JSON format.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No content received from OpenAI');
    }

    // Parse the JSON response from OpenAI
    let recommendations;
    try {
      // Extract JSON from the response (in case there's extra text)
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        recommendations = JSON.parse(jsonMatch[0]);
      } else {
        recommendations = JSON.parse(content);
      }
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError);
      console.log('Raw response:', content);
      
      // Return fallback recommendations if parsing fails
      recommendations = [
        {
          title: "Dune: Part Two",
          year: "2024",
          reason: "Spectacular sci-fi epic with stunning visuals and powerful performances"
        },
        {
          title: "Poor Things",
          year: "2024", 
          reason: "Academy Award-winning dark comedy with Emma Stone's transformative performance"
        },
        {
          title: "The Zone of Interest",
          year: "2024",
          reason: "Haunting Holocaust drama with innovative sound design and powerful storytelling"
        }
      ];
    }

    return NextResponse.json({ recommendations });
  } catch (error) {
    console.error('Error in movie recommendations API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch movie recommendations' },
      { status: 500 }
    );
  }
} 