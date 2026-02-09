import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lines = searchParams.get('lines') || '50';
    
    // SSH command to get real system logs
    const sshCommand = `ssh -i ~/Downloads/ssh-key-2025-12-11.key -o StrictHostKeyChecking=no opc@129.213.161.247 "
      # Get recent system logs
      sudo tail -n ${lines} /var/log/syslog 2>/dev/null || sudo tail -n ${lines} /var/log/messages 2>/dev/null || journalctl -n ${lines} --no-pager -o json 2>/dev/null | while read line; do
        if echo \$line | grep -q '^{'; then
          TIMESTAMP=\$(echo \$line | jq -r '.__REALTIME_TIMESTAMP // empty' 2>/dev/null)
          if [ -n \"\$TIMESTAMP\" ]; then
            TIMESTAMP=\$(date -d \"@\$((\$TIMESTAMP / 1000000))\" '+%Y-%m-%d %H:%M:%S' 2>/dev/null || echo 'Unknown')
          else
            TIMESTAMP=\$(echo \$line | jq -r '.MESSAGE' 2>/dev/null | head -c 19 || echo 'Unknown')
          fi
          MESSAGE=\$(echo \$line | jq -r '.MESSAGE // empty' 2>/dev/null)
          UNIT=\$(echo \$line | jq -r '._SYSTEMD_UNIT // .SYSLOG_IDENTIFIER // \"system\"' 2>/dev/null)
          PRIORITY=\$(echo \$line | jq -r '.PRIORITY // \"6\"' 2>/dev/null)
          
          # Convert priority to level
          case \$PRIORITY in
            0|1|2|3) LEVEL=\"error\" ;;
            4) LEVEL=\"warning\" ;;
            *) LEVEL=\"info\" ;;
          esac
          
          echo \"{\\\\\\"timestamp\\\\\": \\\\\"\$TIMESTAMP\\\\\", \\\\\\"level\\\\\": \\\\\"\$LEVEL\\\\\", \\\\\\"service\\\\\": \\\\\"\$UNIT\\\\\", \\\\\\"message\\\\\": \\\\\"\$(echo \$MESSAGE | sed 's/\"/\\\\\\\"/g' | head -c 200)\\\\\"},\"
        fi
      done | sed '\$s/,\$//' | sed '1i[' | sed '\$a]'
    "`;

    console.log('Executing SSH command to get real logs...');
    const { stdout, stderr } = await execAsync(sshCommand, { timeout: 15000 });
    
    if (stderr && !stderr.includes('Warning')) {
      console.error('SSH stderr:', stderr);
      throw new Error(`SSH error: ${stderr}`);
    }

    console.log('Raw logs output length:', stdout.length);
    
    // Parse the JSON output
    let logs;
    try {
      const cleanOutput = stdout.trim();
      if (cleanOutput === '[]' || cleanOutput === '') {
        logs = [];
      } else {
        logs = JSON.parse(cleanOutput);
      }
    } catch (parseError) {
      console.error('Failed to parse logs JSON:', parseError);
      console.log('Raw output that failed to parse:', stdout.substring(0, 500));
      
      // Fallback: try to get simple tail output
      const fallbackCommand = `ssh -i ~/Downloads/ssh-key-2025-12-11.key -o StrictHostKeyChecking=no opc@129.213.161.247 "sudo tail -n 10 /var/log/syslog 2>/dev/null || sudo tail -n 10 /var/log/messages 2>/dev/null || echo 'No logs available'"`;
      
      const { stdout: fallbackOutput } = await execAsync(fallbackCommand, { timeout: 10000 });
      
      // Convert plain text to JSON format
      logs = fallbackOutput.split('\n')
        .filter(line => line.trim())
        .map((line, index) => ({
          timestamp: new Date().toISOString(),
          level: 'info',
          service: 'system',
          message: line.trim().substring(0, 200)
        }));
    }
    
    return NextResponse.json({
      success: true,
      data: logs,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Error getting Oracle server logs:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      data: [{
        timestamp: new Date().toISOString(),
        level: 'error',
        service: 'dashboard',
        message: `Failed to retrieve logs: ${error.message}`
      }],
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}