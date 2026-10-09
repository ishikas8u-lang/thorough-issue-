/**
 * Native, zero-dependency multipart/form-data parser for Node.js
 */
export function parseMultipartBuffer(buffer, boundary) {
  const result = {};
  const boundaryDelimiter = Buffer.from(`--${boundary}`);
  let startIndex = 0;

  while (startIndex < buffer.length) {
    const boundaryPos = buffer.indexOf(boundaryDelimiter, startIndex);
    if (boundaryPos === -1) break;

    const partStart = boundaryPos + boundaryDelimiter.length;
    // Check if closing boundary: '--'
    if (buffer[partStart] === 0x2d && buffer[partStart + 1] === 0x2d) {
      break;
    }

    let headersStart = partStart;
    if (buffer[headersStart] === 0x0d && buffer[headersStart + 1] === 0x0a) {
      headersStart += 2;
    } else if (buffer[headersStart] === 0x0a) {
      headersStart += 1;
    }

    // Find end of headers
    let headersEnd = buffer.indexOf(Buffer.from('\r\n\r\n'), headersStart);
    let bodyOffset = 4;
    if (headersEnd === -1) {
      headersEnd = buffer.indexOf(Buffer.from('\n\n'), headersStart);
      bodyOffset = 2;
    }
    if (headersEnd === -1) break;

    const headerStr = buffer.subarray(headersStart, headersEnd).toString('utf8');
    const partBodyStart = headersEnd + bodyOffset;

    // Find next boundary
    const nextBoundaryPos = buffer.indexOf(boundaryDelimiter, partBodyStart);
    if (nextBoundaryPos === -1) break;

    let partBodyEnd = nextBoundaryPos;
    if (partBodyEnd >= 2 && buffer[partBodyEnd - 2] === 0x0d && buffer[partBodyEnd - 1] === 0x0a) {
      partBodyEnd -= 2;
    } else if (partBodyEnd >= 1 && buffer[partBodyEnd - 1] === 0x0a) {
      partBodyEnd -= 1;
    }

    const partBody = buffer.subarray(partBodyStart, partBodyEnd);

    // Extract field name and optional filename
    const nameMatch = headerStr.match(/name="([^"]+)"/i);
    const filenameMatch = headerStr.match(/filename="([^"]+)"/i);
    const contentTypeMatch = headerStr.match(/content-type:\s*([^\r\n;]+)/i);

    if (nameMatch) {
      const fieldName = nameMatch[1];
      if (filenameMatch) {
        result[fieldName] = {
          filename: filenameMatch[1],
          mimeType: contentTypeMatch ? contentTypeMatch[1].trim() : 'application/octet-stream',
          buffer: partBody,
        };
      } else {
        result[fieldName] = partBody.toString('utf8');
      }
    }

    startIndex = nextBoundaryPos;
  }

  return result;
}

export function extractBoundary(contentTypeHeader) {
  if (!contentTypeHeader) return null;
  const match = contentTypeHeader.match(/boundary=([^;]+)/i);
  if (!match) return null;
  return match[1].trim().replace(/^["']|["']$/g, '');
}
