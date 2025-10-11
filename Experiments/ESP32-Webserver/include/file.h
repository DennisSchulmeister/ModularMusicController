/* Modular Music Controller - Experiment - ESP32 Web Configuration Portal
 * (C) 2025 Dennis Schulmeister-Zimolong <dennis@windows3.de>
 * 
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 3 of the License, or
 * (at your option) any later version.
 */

/**
 * @file file.h
 * @brief Readers and writers for simplified binary IFF files
 * 
 * To strike a balance between simplicity, memory economy and flexibility,
 * all binary files in the flash memory use a simplified form of the traditional
 * Interchange File Format (IFF) as defined by Electronic Arts on the Amiga and
 * later re-used by Microsoft and others on the PC platform. But unlike these
 * variants we only do the absolute minimum:
 * 
 * - Each file consists of a list of chunks (at least one)
 * - A chunk either contains raw data or a list of child chunks
 * - Each chunk has the following structure:
 *    1. Four bytes: Identification string
 *    2. Four bytes: Byte length of the chunk
 *    3. Chunk data
 * 
 * How the chunk data must be interpreted depends on the chunk type. In many cases
 * it is justed a fixed structure, but it can also be variable length data (e.g.
 * sound samples) or a list of child chunks.
 * 
 * Unlike the original IFF and RIFF formats there is no special file header and no
 * special treatment for a list of chunks. The client reading a file must know from
 * the parent chunk type whether to expect a list of chunks or not or how to interpret
 * the chunk data otherwise.
 * 
 * Chunk lengths are not automatically padded to align on word boundaries. This is
 * left to be done by the clients of this file.
 */
#pragma once
#include <cstdint>      // uint32_t
#include <fstream>      // std::fstream
#include <iostream>     // std::streampos, std::streamoff
#include <string>       // std::string

namespace my_file {

/**
 * @brief Represents a Four-Character Code (FourCC) using a fixed-size array of 4 characters.
 * 
 * Four-Character-Code that identifies the type of a chunk. Note all the `constexpr` here
 * that allow the compiler to fully evaluate the structure at compile time, storing only
 * constant values in the final binary.
 */
struct FourCC {
    std::array<char, 4> code{};

    /**
     * Construct an empty FourCC with four spaces.
     */
    constexpr FourCC() {
        for (int i = 0; i < 4; ++i) code[i] = ' ';
    }

    /**
     * Construct a FourCC from a 5-character string literal (4 characters plus the null terminator).
     * @param str String literal of exactly five characters
     */
    constexpr FourCC(const char (&str)[5]) {
        for (int i = 0; i < 4; ++i) code[i] = str[i];
    }

    /**
     * @brief Compares two FourCC objects for equality.
     * @param other The other FourCC to compare with.
     * @return true if both FourCC codes are equal, false otherwise.
     */
    constexpr bool operator==(const FourCC& other) const noexcept {
        for (int i = 0; i < 4; ++i)
            if (code[i] != other.code[i]) return false;
        return true;
    }

    /**
     * @brief Converts the FourCC to a std::string_view.
     * @return A string_view representing the FourCC code.
     */
    constexpr operator std::string_view() const noexcept {
        return {code.data(), code.size()};
    }
};

/**
 * Header of a data chunk
 */
struct ChunkHeader {
    FourCC type;                    ///< Chunk type
    uint32_t size;                  ///< Number of bytes following the header

    /**
     * Check if the chunk has a size greater than zero.
     */
    constexpr bool has_data() {
        return size > 0;
    }
};

/**
 * Extended chunk header for file reading
 */
struct ReadChunk : ChunkHeader {
    bool is_last = true;            ///< Last chunk of the file or parent list
};

/**
 * Internal read/write cursor to keep track of the file structure.
 */
struct Cursor {
    std::streampos start;           ///< Start position of the chunk
    std::streampos end;             ///< End position of the chunk (start + size)
    std::streamoff offset;          ///< Current offset inside the chunk, points to the next chunk header

    /**
     * Check whether the end of the parent chunk has been reached.
     */
    constexpr bool end_reached() {
        return start + offset >= end;
    }
};

#ifndef MY_FILE_NESTING_LEVEL
#define MY_FILE_NESTING_LEVEL 5     ///< Maximum depth of nested lists
#endif

/**
 * Simplified IFF file reader. Provides functions to read the chunks sequentially.
 * 
 * Note that there is a maximum depth of nested lists as defined by `MY_FILE_NESTING_LEVEL`.
 * This allows us to work with pre-allocated memory of a fixed size.
 */
class IFF_Reader {
public:
    /**
     * Open a file for reading. If the file doesn't exist nothing happens but reading
     * from the file will just return zero length chunks with four spaces as chunk type.
     * The file will be automatically closed when the object is destroyed.
     * 
     * @param[in] filename Filename
     */
    IFF_Reader(std::string filename) noexcept;

    /**
     * Preview the next chunk header. This either returns the next header without consuming
     * it or an empty header (FourCC = space, zero size) in any of the following cases:
     * 
     * - The file could not be opened
     * - While the maximum nesting level is exceeded
     * - The current nesting level has no chunks
     * - The end of the current nesting level has been reached
     * 
     * Therefor, since all other methods call `peek()` to check the header they don't need
     * to perform any of the safety checks.
     * 
     * @returns Header of the next chunk
     */
    ReadChunk peek() noexcept;

    /**
     * Skip next chunk without actually reading it.
     */
    void skip() noexcept;

    /**
     * Read the next chunk into the given buffer. The buffer will be initialized with zeros first,
     * in case the chunk is smaller than the buffer. The next call will always return the next chunk,
     * even if the buffer of the previous call was too small for the whole chunk.
     * 
     * @param[inout] buffer Byte buffer to read into
     * @param[in] maxlen Buffer size
     * @returns the header of the read chunk
     */
    ReadChunk chunk(char* buffer, size_t maxlen) noexcept;

    /**
     * Descend into a nested list. The return value indicates if the list has at least one member.
     * Note, however, that no sanity checks will be performed. The reader must know from the parent
     * chunk type, that a nested list is to be expected.
     * 
     * @returns true, if the list contains values
     */
    bool enter() noexcept;

    /**
     * Ascend one step up from a nested list. This always positions the read curser at the end of
     * the list, even if not all list members have been read or skipped.
     */
    void leave() noexcept;

private:
    std::fstream file;                                      ///< File stream
    size_t level;                                           ///< Current index in the cursor table
    std::array<Cursor, MY_FILE_NESTING_LEVEL> cursor{};     ///< Read cursors for nested chunks
    size_t too_deep;                                        ///< By which amount the maximum nesting depth is exceeded
};

// /**
//  * Simplified IFF file writer. Overwrites the whole file with the given chunks.
//  * 
//  * Note that there is a maximum depth of nested lists as defined by `MY_FILE_NESTING_LEVEL`.
//  * This allows us to work with pre-allocated memory of a fixed size.
//  */
// class IFF_Writer {
// public:
//     /**
//      * Open a file for writing, possibly destroying all contents, if the file already exists.
//      * It is simply assumed that the client will always write out the whole IFF file, even
//      * when only changing a few bytes of it.
//      * 
//      * @param[in] filename Filename
//      */
//     IFF_Writer(std::string filename) noexcept;
// 
//     /**
//      * Used internally to append a list of chunks.
//      * 
//      * @param[in] file Already opened binary file
//      * @param[in] offset Byte offset to the list start
//      */
//     IFF_Writer(FILE* file, size_t offset) noexcept;

//     /**
//      * Append a new chunk to the file.
//      * 
//      * @param[in] type Chunk type
//      * @param[in] buffer Byte buffer to read from
//      * @param[in] maxlen Buffer size
//      */
//     chunk_header_t chunk(char const * type, uint32_t size, void* buffer) noexcept;
// 
//     /**
//      * Start a new child list of chunks. This returns a new object as a view on the source code.
//      * Once the list is finished, `end_list()` must be called and afterwards only the parent
//      * IFF writer shall be used.
//      */
//     IFF_Writer list(char const * type) noexcept;
// 
//     /**
//      * Only relevant for chunk lists. This writes the final length of the whole list
//      * in the length field of the parent chunk.
//      */
//     void end_list() noexcept;
// 
// private:
//     FILE* file;         ///< File pointer
//     size_t offset;      ///< Start offset in the file
//     size_t index;       ///< Current writing offset in the file
//     bool owner;         ///< File must be closed in the destructor
// };

} // namespace my_file