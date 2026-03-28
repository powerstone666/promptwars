import { NextRequest, NextResponse } from 'next/server';
import { Logger } from '../services/logger';

// Create a logger instance for this API route
const logger = new Logger({
  minLevel: 0, // DEBUG level for development
  includeCaller: true,
  format: 'text'
});

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  // Log request details
  logger.info('Health check API called', {
    method: 'GET',
    url: request.url,
    headers: Object.fromEntries(request.headers),
    timestamp: new Date().toISOString()
  });

  try {
    // Simulate some processing
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      responseTime: Date.now() - startTime
    };

    // Log successful response
    logger.info('Health check completed successfully', {
      responseTime: healthStatus.responseTime,
      memoryUsage: healthStatus.memory
    });

    return NextResponse.json(healthStatus, { status: 200 });
    
  } catch (error) {
    // Log error
    logger.error('Health check failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      requestUrl: request.url
    });

    return NextResponse.json(
      { 
        status: 'unhealthy', 
        error: 'Internal server error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  logger.warn('POST method not supported for health endpoint', {
    method: 'POST',
    url: request.url,
    clientIp: request.headers.get('x-forwarded-for') || 'unknown'
  });

  return NextResponse.json(
    { 
      error: 'Method not allowed',
      message: 'Only GET method is supported for health checks'
    },
    { status: 405 }
  );
}