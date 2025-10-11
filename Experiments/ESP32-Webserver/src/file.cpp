/* Modular Music Controller - Experiment - ESP32 Web Configuration Portal
 * (C) 2025 Dennis Schulmeister-Zimolong <dennis@windows3.de>
 * 
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 3 of the License, or
 * (at your option) any later version.
 */

#include "file.h"
#include <cstring>          // std::memset
#include <esp_log.h>        // ESP_LOG…
#include <filesystem>       // std::filesystem

namespace my_file {
constexpr char const* TAG = "file";

////////////////////////////
///// class IFF_Reader /////
////////////////////////////

IFF_Reader::IFF_Reader(std::string filename)
    : file{filename, std::fstream::in | std::fstream::binary},
      level{0},
      cursor{},
      too_deep(0)
{
    if (file.is_open()) {
        cursor[level] = {
            .start  = 0,
            .end    = std::filesystem::file_size(filename),
            .offset = 0,
        };
    }
}

ReadChunk IFF_Reader::peek() {
    ReadChunk header;
    if (!file.is_open())             return header;   // File not found
    if (too_deep > 0)                return header;   // Maximum nesting exceeded
    if (cursor[level].end_reached()) return header;   // End of list reached

    auto pos = cursor[level].start + cursor[level].offset;
    file.clear();
    file.seekg(pos, std::ios::beg);

    file.read(header.type.code.data(), header.type.code.size());
    file.read(reinterpret_cast<char*>(&header.size), sizeof(header.size));
    header.is_last = cursor[level].offset + sizeof(header) + header.size >= cursor[level].end;

    if (file.fail()) return {};    // Ignore truncated chunk header
    return header;
}

void IFF_Reader::skip() {
    ReadChunk header = peek();
    cursor[level].offset += sizeof(header) + header.size;
}

ReadChunk IFF_Reader::chunk(char* buffer, size_t maxlen) {
    ReadChunk header = peek();
    std::memset(buffer, 0, maxlen);
    
    if (header.size > 0) {
        auto pos = cursor[level].start + cursor[level].offset + sizeof(header);
        file.clear();
        file.seekg(pos, std::ios::beg);
        file.read(buffer, maxlen);
    }

    if (!cursor[level].end_reached()) {
        cursor[level].offset += sizeof(header) + header.size;
    }

    return header;
}

bool IFF_Reader::enter() {
    if (level >= MY_FILE_NESTING_LEVEL) {
        ESP_LOGE(TAG, "Maximum IFF file nesting level exceeded! Please increase MY_FILE_NESTING_LEVEL.");
        
        too_deep++;
        return false;
    }

    ReadChunk header = peek();

    cursor[level + 1] = {
        .start  = cursor[level].offset + sizeof(header),                  /// TODO: ???
        .end    = cursor[level].offset + sizeof(header) + header.size,
        .offset = 0,
    };

    cursor[level].offset = cursor[level + 1].end;

    level++;
    return cursor[level].has_data();
}

void IFF_Reader::leave() {
    if (too_deep > 0) {
        too_deep--;
        return;
    }

    if (level > 0) level--;
}

////////////////////////////
///// class IFF_Writer /////
////////////////////////////

} // namespace my_file