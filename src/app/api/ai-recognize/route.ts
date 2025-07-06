import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    if (!process.env.GOOGLE_AI_API_KEY) {
      return NextResponse.json({
        success: false,
        message: "Google AI API key is not configured"
      }, { status: 500 });
    }

    const { imageData } = await request.json();

    if (!imageData) {
      return NextResponse.json({
        success: false,
        message: "No image data provided"
      }, { status: 400 });
    }

    const base64Image = imageData.replace(/^data:image\/[a-z]+;base64,/, '');

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Look at this drawing and tell me what you see. Be creative and fun in your response! 
    
    Please respond in this format:
    🎨 **I think you drew:** [what you see]
    
    ✨ **Details:** [describe the drawing style, colors, shapes, etc.]
    
    🤔 **Confidence:** [High/Medium/Low] - [brief explanation]
    
    💡 **Fun fact:** [an interesting or funny observation about the drawing]
    
    Keep it engaging and friendly!`;

    const imagePart = {
      inlineData: {
        data: base64Image,
        mimeType: "image/png"
      }
    };

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();

    console.log('🤖 AI Drawing Recognition:', text);

    return NextResponse.json({
      success: true,
      recognition: text,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Error in AI drawing recognition:", error);
    
    if (error instanceof Error) {
      if (error.message.includes('API_KEY_INVALID')) {
        return NextResponse.json({
          success: false,
          message: "Invalid Google AI API key"
        }, { status: 401 });
      }
      
      if (error.message.includes('QUOTA_EXCEEDED')) {
        return NextResponse.json({
          success: false,
          message: "API quota exceeded. Please try again later."
        }, { status: 429 });
      }
    }

    return NextResponse.json({
      success: false,
      message: "Failed to analyze drawing. Please try again."
    }, { status: 500 });
  }
}
