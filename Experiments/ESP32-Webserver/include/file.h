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
#include <cstdio>       // FILE
#include <string>       // std::string

namespace my_file {

/**
 * Header of a data chunk
 */
struct chunk_header_t {
    char     type[4];       ///< Chunk type
    uint32_t size;          ///< Number of bytes following the header
};

/**
 * Simplified IFF file reader. Provides functions to read the chunks sequentially.
 */
class iff_reader {
public:
    /**
     * Open a file for reading. If the file doesn't exist nothing happens but reading
     * from the file will just return zero length chunks with four spaces as chunk type.
     * 
     * @param[in] filename Filename
     */
    iff_reader(std::string filename);

    /**
     * Used internally to provide a view on a list of chunks.
     * 
     * @param[in] file Already opened binary file
     * @param[in] offset Byte offset to the list start
     * @param[in] maxlen Length of the list in bytes
     */
    iff_reader(FILE* file, size_t offset, size_t maxlen);

    /**
     * Destructor. Closes the file if it is owned by the object.
     */
    ~iff_reader();

    /**
     * Check whether the end of the file has been reached.
     */
    bool eof();

    /**
     * Preview the next chunk header.
     * @returns Header of the next chunk
     */
    chunk_header_t peek();

    /**
     * Read the next chunk into the given buffer. The buffer will be initialized with zeros first,
     * in case the chunk is smaller than the buffer. The next call will always return the next chunk,
     * even if the buffer of the previous call was too small for the whole chunk.
     * 
     * @param[inout] buffer Byte buffer to read into
     * @param[in] maxlen Buffer size
     * @returns the header of the read chunk
     */
    chunk_header_t chunk(void* buffer, size_t maxlen);

    /**
     * Descend into a chunk list. This will initialize another `iff_reader` instance as a view on
     * the already opened file. For this to work the cursor must be right before the start of a
     * parent chunk that contains the whole list and such its final size.
     * 
     * @returns New `iff_reader` instance to read the child chunks
     */
    iff_reader list();

private:
    FILE* file;         ///< File pointer
    size_t offset;      ///< Start offset in the file
    size_t maxlen;      ///< Maximum number of bytes to read
    size_t index;       ///< Current reading offset in the file
    bool owner;         ///< File must be closed in the destructor
};

/**
 * Simplified IFF file writer. Overwrites the whole file with the given chunks.
 */
class iff_writer {
public:
    /**
     * Open a file for writing, possibly destroying all contents, if the file already exists.
     * It is simply assumed that the client will always write out the whole IFF file, even
     * when only changing a few bytes of it.
     * 
     * @param[in] filename Filename
     */
    iff_writer(std::string filename);

    /**
     * Used internally to append a list of chunks.
     * 
     * @param[in] file Already opened binary file
     * @param[in] offset Byte offset to the list start
     */
    iff_writer(FILE* file, size_t offset);

    /**
     * Destructor. Closes the file if it is owned by the object, and flushes its content.
     */
    ~iff_writer();

    /**
     * Append a new chunk to the file.
     * 
     * @param[in] type Chunk type
     * @param[in] buffer Byte buffer to read from
     * @param[in] maxlen Buffer size
     */
    chunk_header_t chunk(char const * type, uint32_t size, void* buffer);

    /**
     * Start a new child list of chunks. This returns a new object as a view on the source code.
     * Once the list is finished, `end_list()` must be called and afterwards only the parent
     * IFF writer shall be used.
     */
    iff_writer list(char const * type);

    /**
     * Only relevant for chunk lists. This writes the final length of the whole list
     * in the length field of the parent chunk.
     */
    void end_list();

private:
    FILE* file;         ///< File pointer
    size_t offset;      ///< Start offset in the file
    size_t index;       ///< Current writing offset in the file
    bool owner;         ///< File must be closed in the destructor
};

} // namespace my_file