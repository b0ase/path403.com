import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function GET(request: NextRequest) {
  try {
    console.log('Getting real Oracle server stats...');
    
    // Simple commands to get server stats - avoiding complex regex
    const commands = [
      'uptime',
      'free -m', 
      'df -h /',
      'ps aux | wc -l',
      'ss -tun | wc -l',
      'cat /proc/loadavg'
    ];

    const results = await Promise.all(
      commands.map(async (cmd) => {
        const sshCmd = `ssh -i ~/Downloads/ssh-key-2025-12-11.key -o StrictHostKeyChecking=no -o ConnectTimeout=5 opc@129.213.161.247 "${cmd}"`;
        try {
          const { stdout } = await execAsync(sshCmd, { timeout: 8000 });
          return stdout.trim();
        } catch (err) {
          console.error(`Command failed: ${cmd}`, err);
          return null;
        }
      })
    );

    const [uptime, memInfo, diskInfo, procCount, connCount, loadAvg] = results;

    // Parse the results
    let cpu = 0, memory = 0, disk = 0, processes = 0, connections = 0, load = 0;

    // Parse memory info
    if (memInfo) {
      const memLines = memInfo.split('\n');
      const memLine = memLines.find(line => line.startsWith('Mem:'));
      if (memLine) {
        const parts = memLine.split(/\s+/);
        const total = parseInt(parts[1]);
        const used = parseInt(parts[2]);
        memory = Math.round((used / total) * 100);
      }
    }

    // Parse disk info  
    if (diskInfo) {
      const diskLines = diskInfo.split('\n');
      const diskLine = diskLines[1]; // Skip header
      if (diskLine) {
        const usageMatch = diskLine.match(/(\d+)%/);
        if (usageMatch) {
          disk = parseInt(usageMatch[1]);
        }
      }
    }

    // Parse process count
    if (procCount) {
      processes = Math.max(0, parseInt(procCount) - 1); // Subtract 1 for header
    }

    // Parse connection count  
    if (connCount) {
      connections = Math.max(0, parseInt(connCount) - 1); // Subtract 1 for header
    }

    // Parse load average
    if (loadAvg) {
      const loadParts = loadAvg.split(' ');
      load = parseFloat(loadParts[0]) || 0;
      // Convert load to approximate CPU percentage (rough estimate)
      cpu = Math.min(Math.round(load * 25), 100);
    }

    const serverStats = {
      cpu,
      memory, 
      disk,
      uptime: uptime || 'Unknown',
      processes,
      connections,
      load,
      timestamp: new Date().toISOString()
    };

    console.log('Parsed server stats:', serverStats);
    
    return NextResponse.json({
      success: true,
      data: {
        server_id: 'oracle-zerodice',
        ip: '129.213.161.247',
        location: 'Oracle Cloud - US West',
        status: 'running',
        ...serverStats
      }
    });

  } catch (error: any) {
    console.error('Error getting Oracle server stats:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      data: {
        server_id: 'oracle-zerodice',
        ip: '129.213.161.247', 
        location: 'Oracle Cloud - US West',
        status: 'connection_error',
        cpu: 0,
        memory: 0,
        disk: 0,
        uptime: 'Unable to connect',
        processes: 0,
        connections: 0,
        load: 0,
        timestamp: new Date().toISOString(),
        error_message: error.message
      }
    }, { status: 500 });
  }
}