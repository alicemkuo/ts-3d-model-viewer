<%_ if (arg.isNumber || arg.isEnum || arg.isErrorCode) { _%>
    _to = Napi::Number::New(env, <%- (arg.isPointer) ? '*' : '' %><%- arg.name %>);
<%_ } else if (arg.isBoolean) { _%>
    _to = Napi::Boolean::New(env, <%- arg.name %>);
<%_ } else if (arg.isNumberPair) { _%>
    Napi::Uint32Array arr_<%- arg.name %> = Napi::Uint32Array::New(env, 2);
    arr_<%- arg.name %>[0] = Napi::Number::New(env, <%- arg.name %>->first);
    _to = arr_<%- arg.name %>;
<%_ } else if (arg.isArray) { _%>
    Napi::Array arr_<%- arg.name %> = Napi::Array::New(env);
    for (size_t i = 0; i < <%- arg.name %><%- skipCopy || arg.shouldAlloc ? '->' : '.' %><%- arg.isVector ? 'size' : 'Count' %>(); i++) {
        <%_ if (arg.elementType.rawType === "double") { _%>
            arr_<%- arg.name %>[i] = (*<%- arg.name %>)[i];
        <%_ } else { _%>
            arr_<%- arg.name %>[i] = <%- arg.elementType.cppType %>::NewInstance(env,
                <% if (arg.elementType.klass?.isPOD) { %>
                    (*<%- arg.name %>)[i]
                <% } else if (arg.isStructArray) { %>
                    new <%- arg.elementType.rawType %>((*<%- arg.name %>)[i])
                <% } else { %>
                    (<%- skipCopy || arg.shouldAlloc ? '*' : '' %><%- arg.name %>)[i]
                <% } %>
            );
        <%_ } _%>
    }
    _to = arr_<%- arg.name %>;
<%_ } else if (arg.isBuffer) { _%>
    _to = Napi::Buffer<char>::New(env, (char *)<%- arg.name %>, size,
        [](Napi::Env, char *finalizeData)
        {
            delete[] finalizeData;
        });
<%_ } else if (arg.isSPtr) { _%>
    _to = <%- arg.elementType.cppType %>::NewInstance(env, <%- arg.name %>.detach());
<%_ } else if (arg.klass?.isPOD) { _%>
    _to = <%- arg.cppType %>::NewInstance(env, <%- arg.name %>);
<%_ } else if (!skipCopy && arg.isOnStack) { _%>
    _to = <%- arg.cppType %>::NewInstance(env, new <%- arg.rawType %>(<%- arg.name %>));
<%_ } else if (!arg.isPointer && !arg.shouldAlloc) { _%>
    _to = <%- arg.cppType %>::NewInstance(env, (<%- arg.rawType %> *)&(<%- arg.name %>));
<%_ } else { _%>
    if (<%- arg.name %> != NULL) {
        _to = <%- arg.cppType %>::NewInstance(env, (<%- arg.rawType %> *)<%- arg.name %>);
    } else {
        _to = env.Null();
    }
<%_ } _%>
