import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function GET(request: NextRequest) {
  try {
    // SSH command to get real running processes
    const sshCommand = `ssh -i ~/Downloads/ssh-key-2025-12-11.key -o StrictHostKeyChecking=no opc@129.213.161.247 "
      # Get top processes with details
      ps aux --sort=-%cpu | head -20 | tail -n +2 | while read line; do
        USER=\$(echo \$line | awk '{print \$1}')
        PID=\$(echo \$line | awk '{print \$2}')
        CPU=\$(echo \$line | awk '{print \$3}')
        MEM=\$(echo \$line | awk '{print \$4}')
        TIME=\$(echo \$line | awk '{print \$10}')
        COMMAND=\$(echo \$line | awk '{for(i=11;i<=NF;i++) printf \"%s \", \$i; print \"\"}' | sed 's/\"/\\\\\"/g')
        
        # Get process status
        STATUS=\$(ps -o stat= -p \$PID 2>/dev/null || echo 'Z')
        
        echo \"{\\\\\\"user\\\\\": \\\\\"\$USER\\\\\", \\\\\\"pid\\\\\": \$PID, \\\\\\"cpu\\\\\": \$CPU, \\\\\\"memory\\\\\": \$MEM, \\\\\\"time\\\\\": \\\\\"\$TIME\\\\\", \\\\\\"command\\\\\": \\\\\"\$COMMAND\\\\\", \\\\\\"status\\\\\": \\\\\"\$STATUS\\\\\"},\"
      done | sed '\$s/,\$//' | sed '1i[' | sed '\$a]'
    "`;

    console.log('Executing SSH command to get real processes...');
    const { stdout, stderr } = await execAsync(sshCommand, { timeout: 15000 });
    
    if (stderr && !stderr.includes('Warning')) {
      console.error('SSH stderr:', stderr);
      throw new Error(`SSH error: ${stderr}`);
    }

    console.log('Raw processes output:', stdout);
    
    // Parse the JSON output
    let processes;
    try {
      processes = JSON.parse(stdout.trim());
    } catch (parseError) {
      console.error('Failed to parse processes JSON:', parseError);
      console.log('Raw output that failed to parse:', stdout);
      throw new Error('Failed to parse process data');
    }
    
    return NextResponse.json({
      success: true,
      data: processes,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Error getting Oracle server processes:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      data: [],
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}