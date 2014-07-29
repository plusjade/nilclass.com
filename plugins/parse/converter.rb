class Ruhoh
  module Converter
    module Presentation
      def self.extensions
        ['.nilclass']
      end
      def self.convert(content)
        MultiJson.encode(course: NilclassParse.new(content).payload)
      end
    end
  end
end
