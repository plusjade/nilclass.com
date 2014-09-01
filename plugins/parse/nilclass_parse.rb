class NilclassParse
  def initialize(content)
    @content = content
    @total_lines = @content.to_s.empty? ? 0 : @content.lines.count
  end

  def payload
    attributes.merge({ "steps" => steps })
  end

  # Top Level attributes for this course.
  def attributes
    json = ''
    data_open = false
    data_close = false
    @content.each_line do |line|
      if line.start_with?('{')
        data_open = true
      elsif line.start_with?('}')
        data_open = false
        data_close = true
        json += line
        break
      end

      if data_open
        json += line
      end
    end

    json.empty? ? {} : MultiJson.decode(json)
  end

  # Parsed steps for this course.
  def steps
    @steps ||= headers_human.each_with_index.map do |header, i|
                parse_chunk(i).merge({
                  title: header,
                  index: i,
                })
              end
  end

  def headers_human
    @headers_human ||= _headers_human
  end

  def _headers_human
    headers.map do |header|
      header[:content].slice(1, header[:content].length).strip
    end
  end

  def headers
    @headers ||= _headers
  end

  def _headers
    headers = []
    @content.each_line.each_with_index do |line, i|
      next unless line.start_with?("# ")

      headers << {
        index: i,
        content: line,
      }
    end

    headers
  end

  def parse_chunk(index)
    return {} unless headers[index]

    end_index = headers[index+1] ? headers[index+1][:index] : @total_lines

    output = @content
              .lines
              .to_a
              .slice(headers[index][:index], (end_index-headers[index][:index]))
              .join

    data_open = false
    data_close = false
    json = ''
    content = ''

    output.each_line.each_with_index do |line, i|
      next if i.zero? # Don't include the title in the content.
      if line.start_with?('{')
        data_open = true
      elsif line.start_with?('}')
        data_open = false
        data_close = true
        json += line
        next
      end

      if data_close || !data_open
        content += line
      else
        json += line
      end
    end

    metadata = json.empty? ? {} : MultiJson.decode(json)

    {
      content: OutputRenderer.markdown(content)
    }.merge(metadata)
  end
end
